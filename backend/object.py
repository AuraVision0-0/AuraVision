from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# ✅ Load YOLOv8 model once
try:
    model = YOLO("yolov8n.pt")
    print("✅ YOLOv8 model loaded successfully")
except Exception as e:
    print("❌ Error loading model:", e)
    model = None


@app.route("/object", methods=["POST"])
def detect_objects():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.json
        image_b64 = data.get("imageBase64")

        if not image_b64:
            return jsonify({"error": "No image provided"}), 400

        # Decode base64 → image
        image_data = base64.b64decode(image_b64)
        np_arr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Run YOLO detection
        results = model(img, verbose=False)

        objects = []
        for r in results[0].boxes:
            cls_id = int(r.cls[0])
            label = model.names[cls_id]
            conf = float(r.conf[0])
            if conf > 0.4:  # ignore weak detections
                box = [int(x) for x in r.xyxy[0].tolist()]
                objects.append({"label": label, "confidence": conf, "box": box})
                # draw bounding box for preview
                cv2.rectangle(img, (box[0], box[1]), (box[2], box[3]), (0, 255, 0), 2)
                cv2.putText(
                    img,
                    f"{label} {conf:.2f}",
                    (box[0], box[1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 255, 0),
                    2,
                )

        # Encode preview image back to base64
        _, buffer = cv2.imencode(".jpg", img)
        img_b64 = base64.b64encode(buffer).decode("utf-8")

        return jsonify({"objects": objects, "preview": img_b64})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Make sure your phone and PC are on the same Wi-Fi
    app.run(host="0.0.0.0", port=5000, debug=True)
