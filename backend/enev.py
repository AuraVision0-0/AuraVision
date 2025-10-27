import os
os.environ["USE_TF"] = "0"  # ensure Transformers uses PyTorch only
os.environ["TRANSFORMERS_NO_TF_WARNING"] = "1"

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import base64
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration

app = Flask(__name__)
CORS(app)

# Load BLIP model (lightweight & accurate)
print("🔄 Loading BLIP model... please wait")
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
print("✅ Model loaded successfully on", device)


def decode_image(image_base64):
    """Decode base64 string to PIL image"""
    image_data = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    return image


@app.route("/enev", methods=["POST"])
def describe_environment():
    try:
        data = request.get_json()
        image_base64 = data.get("imageBase64")
        if not image_base64:
            return jsonify({"error": "No imageBase64 provided"}), 400

        # Decode image
        image = decode_image(image_base64)

        # Prepare input for model
        inputs = processor(image, return_tensors="pt").to(device)

        # Generate caption
        out = model.generate(**inputs, max_new_tokens=40)
        caption = processor.decode(out[0], skip_special_tokens=True)

        print("📝 Generated caption:", caption)

        # Return structured response
        return jsonify({
            "objects": [{"label": caption}],
            "caption": caption
        }), 200

    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("✅ Environment description server running on http://0.0.0.0:5002/enev")
    app.run(host="0.0.0.0", port=5002, debug=True)
