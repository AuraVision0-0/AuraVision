from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API Key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Correct working model name (IMPORTANT)
#MODEL_NAME = "gemini-2.5-pro-exp-03-25"


@app.route("/aibot", methods=["POST"])
def aibot():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "")

        model = genai.GenerativeModel('gemini-2.5-flash')

        response = model.generate_content(prompt)

        # Extract text
        return jsonify({"reply": response.text})

    except Exception as e:
        return jsonify({"reply": f"⚠️ Error: {str(e)}"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005)
