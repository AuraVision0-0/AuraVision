# app.py
# Flask backend for bus + number detection
# Accepts POST JSON {"imageBase64": "<base64string>"}
# Returns: { "description": "Bus 120 detected", "preview": "<base64 of annotated image>" }

from flask import Flask, request, jsonify
import base64
import io
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from ultralytics import YOLO
import easyocr
import cv2

app = Flask(__name__)

# Load YOLOv8 model and OCR
model = YOLO("yolov8n.pt")  # lightweight model
reader = easyocr.Reader(['en'], gpu=False)


def detect_bus_and_number(img_pil):
    """Detect buses and read their numbers."""
    np_img = np.array(img_pil.convert("RGB"))
    results = model.predict(source=np_img, imgsz=640, conf=0.35, verbose=False)
    r = results[0]
    class_names = model.model.names
    draw = ImageDraw.Draw(img_pil)

    detected_buses = []
    boxes = []
    for box, conf, cls in zip(r.boxes.xyxy.cpu().numpy(), r.boxes.conf.cpu().numpy(), r.boxes.cls.cpu().numpy()):
        cls_name = class_names.get(int(cls), "")
        if cls_name.lower() == "bus":
            x1, y1, x2, y2 = [int(v) for v in box]
            boxes.append((x1, y1, x2, y2))
            crop = img_pil.crop((x1, y1, x2, y2))

            ocr_results = reader.readtext(np.array(crop))
            texts = [t for (_, t, _) in ocr_results if any(ch.isdigit() for ch in t)]
            bus_number = texts[0] if texts else "Unknown"
            detected_buses.append(bus_number)

            # Draw bounding box and label
            draw.rectangle([x1, y1, x2, y2], outline="red", width=3)
            draw.text((x1, y1 - 10), f"Bus {bus_number}", fill="red")

    description = "No bus detected."
    if detected_buses:
        joined = ", ".join(detected_buses)
        description = f"Detected bus number(s): {joined}."
    return description, img_pil


@app.route("/bus", methods=["POST"])
def detect():
    try:
        data = request.get_json()
        if not data or "imageBase64" not in data:
            return jsonify({"error": "Missing imageBase64"}), 400

        image_b64 = data["imageBase64"]
        image_bytes = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(image_bytes))

        description, annotated_img = detect_bus_and_number(img)

        # Convert annotated image back to base64
        buffered = io.BytesIO()
        annotated_img.save(buffered, format="JPEG")
        preview_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return jsonify({"description": description, "preview": preview_b64})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=True)
