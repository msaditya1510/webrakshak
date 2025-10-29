from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import os
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import json

# === Flask app setup ===
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": [
    "https://webrakshak.vercel.app",
    "http://localhost:5173"
]}})

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin in ["https://webrakshak.vercel.app", "http://localhost:5173"]:
        response.headers.add("Access-Control-Allow-Origin", origin)
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response


# === Model Paths ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
URL_MODEL_FILE = "url_model.joblib"
IMAGE_MODEL_FILE = "image_model.tflite"

url_model_path = os.path.join(MODEL_DIR, URL_MODEL_FILE)
image_model_path = os.path.join(MODEL_DIR, IMAGE_MODEL_FILE)


# === Load models ===
print("🔹 Loading models into memory...")
try:
    url_model_data = joblib.load(url_model_path)
    if isinstance(url_model_data, dict):
        url_model = url_model_data.get("model", None)
        feature_selector = url_model_data.get("feature_selector", None)
        feature_names = url_model_data.get("feature_names", None)
        print(f"✅ URL model loaded with {len(feature_names)} features.")
    else:
        url_model = url_model_data
        feature_selector = None
        feature_names = None
        print("⚠ URL model is raw estimator only.")
except Exception as e:
    print("❌ Failed to load URL model:", e)
    url_model = feature_selector = feature_names = None


# === Load image model ===
try:
    interpreter = tf.lite.Interpreter(model_path=image_model_path)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print("✅ Image model loaded successfully.")
except Exception as e:
    print("⚠ Image model load failed:", e)
    interpreter = None
    input_details = output_details = None


# === URL preprocessing (fixed) ===
def preprocess_url_features(url):
    """
    Convert a URL into a numeric vector matching the trained model's feature_names.
    Uses a placeholder encoding for now (based on ASCII values).
    """
    import pandas as pd

    if not feature_names:
        raise ValueError("Feature names not loaded from model")

    # Convert URL characters to numeric values
    numeric = [ord(c) % 32 for c in url.lower()]

    # Adjust to match model’s expected feature length
    if len(numeric) < len(feature_names):
        numeric += [0] * (len(feature_names) - len(numeric))
    elif len(numeric) > len(feature_names):
        numeric = numeric[:len(feature_names)]

    df = pd.DataFrame([numeric], columns=feature_names)
    print(f"🔍 Preprocessed features: {df.shape}, Expected: {len(feature_names)}")
    return df


# === URL scanning ===
@app.route("/scan/url", methods=["POST"])
def scan_url():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "Missing URL"}), 400
    if url_model is None:
        return jsonify({"error": "URL model not loaded"}), 500

    try:
        x = preprocess_url_features(url)
        if feature_selector:
            x = feature_selector.transform(x)
        if hasattr(url_model, "predict_proba"):
            score = float(url_model.predict_proba(x)[0][1])
        else:
            score = float(url_model.predict(x)[0])
        print(f"✅ Prediction success → {url} | Score: {score:.4f}")
    except Exception as e:
        print("❌ URL prediction failed:", e)
        score = 0.5

    phishing = score > 0.6
    color = "red" if phishing else "green" if score < 0.3 else "yellow"
    message = (
        "🚨 Phishing Detected!" if phishing else
        "✅ Safe Link" if score < 0.3 else
        "⚠ Suspicious - Be Cautious"
    )

    return jsonify({"url": url, "score": score, "status": message, "color": color})


# === Image scanning ===
@app.route("/scan/image", methods=["POST"])
def scan_image():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    if interpreter is None:
        return jsonify({"error": "Image model not loaded"}), 500

    img_file = request.files["image"]
    img = image.load_img(img_file, target_size=(224, 224))
    x = image.img_to_array(img) / 255.0
    x = np.expand_dims(x, axis=0).astype(np.float32)

    try:
        interpreter.set_tensor(input_details[0]['index'], x)
        interpreter.invoke()
        score = float(interpreter.get_tensor(output_details[0]['index'])[0][0])
    except Exception as e:
        print("⚠ Image prediction failed:", e)
        score = 0.5

    phishing = score > 0.6
    color = "red" if phishing else "green" if score < 0.3 else "yellow"
    message = (
        "🚨 Phishing Image!" if phishing else
        "✅ Safe Image" if score < 0.3 else
        "⚠ Suspicious - Check Carefully"
    )

    return jsonify({"score": score, "status": message, "color": color})


# === Feedback ===
FEEDBACK_PATH = os.path.join(MODEL_DIR, "reward_memory.json")

@app.route("/feedback/url", methods=["POST"])
def feedback_url():
    data = request.get_json()
    url = data.get("url")
    phish = data.get("phish", False)

    feedback_data = {}
    if os.path.exists(FEEDBACK_PATH):
        with open(FEEDBACK_PATH, "r") as f:
            feedback_data = json.load(f)

    feedback_data[url] = {"label": "phish" if phish else "safe"}
    with open(FEEDBACK_PATH, "w") as f:
        json.dump(feedback_data, f, indent=2)

    reward = 1 if phish else -1
    return jsonify({
        "message": "✅ Feedback recorded successfully.",
        "url": url,
        "reward": reward
    })


# === Health check ===
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "message": "Backend active with locally hosted models and feature selector."
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
