from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import base64

app = Flask(__name__)
CORS(app)

# Load YOLOv8 small model
model = YOLO("yolov8s.pt")

# Known object widths (cm)
KNOWN_WIDTHS = {
    "person": 40,
    "chair": 50,
    "bottle": 7,
    "laptop": 30,
    "tv": 90,
    "table": 80,
}

# Default width for unknown objects
DEFAULT_WIDTH = 30

# Focal length approximation for mobile camera
FOCAL_LENGTH = 850


def decode_image(base64_str):
    """Convert base64 to OpenCV image"""
    image_data = base64.b64decode(base64_str)
    np_arr = np.frombuffer(image_data, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return image


def estimate_distance(bbox_width_px, label):
    """Estimate distance using pinhole camera model"""
    if bbox_width_px <= 0:
        return None
    real_width = KNOWN_WIDTHS.get(label, DEFAULT_WIDTH)
    distance_cm = (real_width * FOCAL_LENGTH) / bbox_width_px
    return round(distance_cm, 1)


@app.route("/dist", methods=["POST"])
def detect_objects_distance():
    try:
        data = request.get_json()
        image_base64 = data.get("imageBase64")
        if not image_base64:
            return jsonify({"error": "No imageBase64 provided"}), 400

        # Decode image
        image = decode_image(image_base64)

        # Detect objects with YOLOv8
        results = model(image, imgsz=640, conf=0.5)
        detections = results[0].boxes
        objects = []

        for box in detections:
            cls_id = int(box.cls)
            label = model.names[cls_id]
            conf = float(box.conf)
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            bbox_width = x2 - x1

            distance = estimate_distance(bbox_width, label)
            objects.append({"label": label, "distance_cm": distance})

            # Draw bounding box for preview
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(image, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # Create spoken description
        if not objects:
            description = "No objects detected nearby."
        else:
            description = ", and ".join(
                [f"The {obj['label']} is {int(obj['distance_cm'])} centimeters from you" for obj in objects]
            ) + "."

        # Encode image preview with bounding boxes
        _, buffer = cv2.imencode(".jpg", image)
        preview_b64 = base64.b64encode(buffer).decode("utf-8")

        return jsonify({
            "objects": objects,
            "description": description,
            "preview": preview_b64
        })

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("✅ Object detection + distance server running on http://0.0.0.0:5003/dist")
    app.run(host="0.0.0.0", port=5003, debug=True)
