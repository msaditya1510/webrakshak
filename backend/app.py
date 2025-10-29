from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import os
import requests
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import json

# === Flask app setup ===
app = Flask(__name__)

# Allow both local dev and production origins
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


# === MODEL LOCATIONS ON GITHUB (RAW LINKS) ===
GITHUB_BASE = "https://raw.githubusercontent.com/msaditya1510/webrakshak/main/backend/"
URL_MODEL_FILE = "url_model.joblib"
IMAGE_MODEL_FILE = "image_model.tflite"

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)
url_model_path = os.path.join(MODEL_DIR, URL_MODEL_FILE)
image_model_path = os.path.join(MODEL_DIR, IMAGE_MODEL_FILE)


# === Helper: Download model from GitHub raw link ===
def fetch_from_github(file_name, dest_path):
    if not os.path.exists(dest_path):
        print(f"⬇ Downloading {file_name} from GitHub...")
        url = GITHUB_BASE + file_name
        r = requests.get(url)
        if r.status_code == 200:
            with open(dest_path, "wb") as f:
                f.write(r.content)
            print(f"✅ {file_name} saved to {dest_path}")
        else:
            print(f"❌ Failed to download {file_name}: {r.status_code}")
    else:
        print(f"✅ {file_name} already exists at {dest_path}")


# Download models if missing
fetch_from_github(URL_MODEL_FILE, url_model_path)
fetch_from_github(IMAGE_MODEL_FILE, image_model_path)


# === Load models ===
print("🔹 Loading models into memory...")
try:
    url_model = joblib.load(url_model_path)
    print("✅ URL model loaded successfully.")
except Exception as e:
    print("⚠ URL model load failed:", e)
    url_model = None

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


# === URL preprocessing ===
def preprocess_url(url):
    url = url.lower()
    max_len = 200
    x = [ord(c) for c in url[:max_len]]
    if len(x) < max_len:
        x += [0] * (max_len - len(x))
    return np.array([x])


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
        x = preprocess_url(url)
        score = float(url_model.predict_proba(x)[0][1])
    except Exception as e:
        print("⚠ Prediction failed:", e)
        score = 0.5

    phishing = score > 0.5
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

    phishing = score > 0.5
    color = "red" if phishing else "green" if score < 0.3 else "yellow"
    message = (
        "🚨 Phishing Image!" if phishing else
        "✅ Safe Image" if score < 0.3 else
        "⚠ Suspicious - Check Carefully"
    )

    return jsonify({"score": score, "status": message, "color": color})


# === Feedback (Federated Reinforcement Simulation) ===
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
        "message": "Backend active with GitHub-hosted models and feedback learning."
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
