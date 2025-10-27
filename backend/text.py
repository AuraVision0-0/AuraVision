from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io, base64, easyocr, traceback, numpy as np

app = Flask(__name__)
CORS(app)

reader = easyocr.Reader(['en'], gpu=False)

def decode_image(image_base64):
    """Decode base64 string to PIL Image."""
    try:
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        return image
    except Exception as e:
        print("❌ Image decoding failed:", e)
        raise

@app.route("/text", methods=["POST"])
def read_text():
    try:
        print("📥 Received POST /text")

        data = request.get_json()
        image_base64 = data.get("imageBase64")
        if not image_base64:
            return jsonify({"error": "No imageBase64 provided"}), 400

        # Decode to PIL and convert to numpy array for EasyOCR
        image = decode_image(image_base64)
        image_np = np.array(image)
        print("🖼️ Image decoded and converted to NumPy")

        # Run OCR
        result = reader.readtext(image_np)
        print("🔍 OCR raw result:", result)

        if not result:
            return jsonify({"objects": [{"label": "No readable text detected."}]}), 200

        combined_text = " ".join([item[1] for item in result])
        print("📝 Combined Text:", combined_text)

        return jsonify({"objects": [{"label": combined_text}]}), 200

    except Exception as e:
        print("❌ Error:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("✅ OCR server running on http://0.0.0.0:5001/text")
    app.run(host="0.0.0.0", port=5001, debug=True)
