from flask import Flask, request, jsonify
import base64
import cv2
import numpy as np
from ultralytics import YOLO

app = Flask(__name__)

# ✅ Load model once at startup
model = YOLO("yolov8n.pt")  # small YOLOv8 model, auto-downloads if missing

@app.route("/ObjectDetection", methods=["POST"])
def detect_objects():
    try:
        data = request.json
        image_b64 = data.get("imageBase64")

        if not image_b64:
            return jsonify({"error": "No image provided"}), 400

        # Decode base64 → image
        image_data = base64.b64decode(image_b64)
        np_arr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Run detection
        results = model(img, verbose=False)

        objects = []
        for r in results[0].boxes:
            cls_id = int(r.cls[0])
            label = model.names[cls_id]
            conf = float(r.conf[0])
            box = [float(x) for x in r.xyxy[0].tolist()]
            objects.append({"label": label, "confidence": conf, "box": box})

        return jsonify({"objects": objects})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
