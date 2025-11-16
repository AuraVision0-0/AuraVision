from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import os
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv
import traceback

# ----------------------------------------------------------
# 1️⃣ Load environment variables (.env file)
# ----------------------------------------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ Missing GEMINI_API_KEY in .env file")

# ----------------------------------------------------------
# 2️⃣ Initialize Flask app and Gemini API
# ----------------------------------------------------------
app = Flask(__name__)
CORS(app)
genai.configure(api_key=GEMINI_API_KEY)

# ✅ Use latest model name (as of Nov 2025)
model = genai.GenerativeModel("gemini-2.0-flash")

# ----------------------------------------------------------
# 3️⃣ Define endpoint for text extraction
# ----------------------------------------------------------
@app.route("/text", methods=["POST"])
def extract_text_from_image():
    try:
        data = request.get_json()
        if not data or "imageBase64" not in data:
            return jsonify({"error": "Missing imageBase64 in request"}), 400

        # Decode base64
        image_b64 = data["imageBase64"]
        image_bytes = base64.b64decode(image_b64)

        print(f"📸 Received image, size: {len(image_bytes)} bytes")

        # Try to open image
        try:
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as img_err:
            print("❌ PIL failed to open image:", img_err)
            raise ValueError("Invalid image data received. Check base64 encoding.")

        # OCR prompt
        prompt = (
            "Extract all readable printed or handwritten text from this image. "
            "Return only the recognized text clearly, no descriptions."
        )

        # Send to Gemini
        print("🧠 Sending request to Gemini model...")
        response = model.generate_content(
            [prompt, {"mime_type": "image/jpeg", "data": image_bytes}]
        )

        # Extract text
        text_result = getattr(response, "text", "").strip() if response else ""
        if not text_result:
            text_result = "No readable text detected."

        # Create preview
        preview_io = io.BytesIO()
        image.thumbnail((400, 400))
        image.save(preview_io, format="JPEG")
        preview_b64 = base64.b64encode(preview_io.getvalue()).decode("utf-8")

        print(f"✅ Extracted text (first 100 chars): {text_result[:100]}")

        return jsonify({
            "objects": [{"label": text_result}],
            "preview": preview_b64
        })

    except Exception as e:
        print("❌ Error processing image:", str(e))
        print(traceback.format_exc())  # show full error details
        return jsonify({"error": str(e)}), 500


# ----------------------------------------------------------
# 4️⃣ Run Flask app
# ----------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
