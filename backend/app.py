from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import os, requests, numpy as np, torch, tensorflow as tf
from tensorflow.keras.preprocessing import image
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from urllib.parse import urlparse

# === Flask setup ===
app = Flask(__name__)

# ✅ Allow both localhost and production
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://webrakshak.vercel.app"
]

CORS(app, supports_credentials=True, resources={r"/*": {"origins": ALLOWED_ORIGINS}})

# ✅ Add CORS headers after every request
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Vary"] = "Origin"
    return response

# ✅ Explicitly handle OPTIONS preflight
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        origin = request.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
        response.headers["Vary"] = "Origin"
        return response, 200

# === Whitelist setup ===
DEFAULT_WHITELIST = [
    "paypal.com",
    "wikipedia.org",
    "zoom.us",
    "whatsapp.com",
    "github.com",
    "instagram.com",
    "linkedin.com",
    "reddit.com",
    "microsoft.com",
    "yahoo.com",
    "amazon.com",
    "youtube.com",
    "apple.com",
    "netflix.com",
    "google.com",
    "facebook.com",
    "cloudflare.com"
]

_whitelist_env = os.environ.get("WHITELIST_DOMAINS", "").strip()
if _whitelist_env:
    WHITELIST_DOMAINS = [d.strip().lower() for d in _whitelist_env.split(",") if d.strip()]
else:
    WHITELIST_DOMAINS = [d.lower() for d in DEFAULT_WHITELIST]


# === Whitelist checking ===
def normalize_netloc(netloc: str) -> str:
    """Normalize hostname, removing port and lowercasing."""
    return netloc.split(":")[0].lower() if ":" in netloc else netloc.lower()

def is_whitelisted(url: str) -> (bool, str):
    """Return (True, matched_domain) if host matches whitelist exactly or as a subdomain."""
    try:
        if "://" not in url:
            url = "http://" + url
        parsed = urlparse(url)
        host = normalize_netloc(parsed.netloc)

        if not host:
            return False, ""

        for domain in WHITELIST_DOMAINS:
            domain = domain.lstrip(".").lower()
            if host == domain or host.endswith(f".{domain}"):
                return True, domain
        return False, ""
    except Exception:
        return False, ""


# === Download helper ===
def fetch_from_github(file_name, dest_path):
    if not os.path.exists(dest_path):
        print(f"⬇️ Downloading {file_name} from GitHub...")
        r = requests.get(f"https://raw.githubusercontent.com/msaditya1510/webrakshak/main/backend/models/{file_name}")
        if r.status_code == 200:
            with open(dest_path, "wb") as f:
                f.write(r.content)
            print(f"✅ {file_name} downloaded successfully.")
        else:
            print(f"❌ Failed to download {file_name}: {r.status_code}")
    else:
        print(f"✅ {file_name} already exists locally.")


# === Setup model directory ===
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# === Load image model ===
IMAGE_MODEL_FILE = "image_model.tflite"
image_model_path = os.path.join(MODEL_DIR, IMAGE_MODEL_FILE)
fetch_from_github(IMAGE_MODEL_FILE, image_model_path)

interpreter = None
try:
    interpreter = tf.lite.Interpreter(model_path=image_model_path)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print("✅ Image model loaded successfully.")
except Exception as e:
    print("⚠️ Image model failed to load:", e)
    interpreter = None
    input_details = output_details = None


# === Load URL model ===
print("🚀 Loading URLBERT model...")
tokenizer = url_model = None
try:
    tokenizer = AutoTokenizer.from_pretrained("CrabInHoney/urlbert-tiny-v4-malicious-url-classifier")
    url_model = AutoModelForSequenceClassification.from_pretrained("CrabInHoney/urlbert-tiny-v4-malicious-url-classifier")
    url_model.eval()
    print("✅ URLBERT model loaded successfully.")
except Exception as e:
    print("⚠️ URL model load failed:", e)


# === URL scanning ===
@app.route("/scan/url", methods=["POST"])
def scan_url():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "Missing URL"}), 400

    # ✅ Whitelist check first
    whitelisted, matched_domain = is_whitelisted(url)
    if whitelisted:
        print(f"✅ Whitelisted domain detected: {url} ({matched_domain}) — Skipping model.")
        return jsonify({
            "url": url,
            "label": "safe",
            "confidence": 1.0,
            "status": "✅ Safe URL (Trusted Domain)",
            "color": "green"
        })

    if not tokenizer or not url_model:
        return jsonify({"error": "URL model not loaded"}), 500

    try:
        inputs = tokenizer(url, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = url_model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            pred_id = probs.argmax(dim=1).item()
            pred_label = url_model.config.id2label[pred_id]
            confidence = float(probs[0][pred_id])
    except Exception as e:
        print("⚠️ URL prediction failed:", e)
        return jsonify({"error": str(e)}), 500

    if pred_label.lower() in ["benign", "safe"]:
        color, msg = "green", "✅ Safe URL"
    elif pred_label.lower() in ["malicious", "phishing"]:
        color, msg = "red", "🚨 Malicious or Phishing Detected!"
    else:
        color, msg = "yellow", "⚠️ Suspicious - Check Carefully"

    print(f"🔍 URL Scanned: {url} → {msg} ({confidence:.2f})")

    return jsonify({
        "url": url,
        "label": pred_label,
        "confidence": confidence,
        "status": msg,
        "color": color
    })


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
    interpreter.set_tensor(input_details[0]['index'], x)
    interpreter.invoke()
    score = float(interpreter.get_tensor(output_details[0]['index'])[0][0])

    phishing = score > 0.5
    color = "red" if phishing else "green" if score < 0.3 else "yellow"
    msg = "🚨 Phishing Image!" if phishing else "✅ Safe Image" if score < 0.3 else "⚠️ Suspicious - Check Carefully"

    print(f"🖼️ Image scanned → {msg} (score={score:.2f})")

    return jsonify({"score": score, "status": msg, "color": color})


# === Health check ===
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "message": "Backend active with URLBERT + TFLite phishing detection.",
        "models": {
            "urlbert": "loaded" if url_model else "not loaded",
            "image_model": "loaded" if interpreter else "not loaded"
        },
        "whitelist": WHITELIST_DOMAINS
    })


# === Run app ===
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("\n🚀 Starting Flask server...")
    app.run(host="0.0.0.0", port=port)
    print("✅ Flask app ready.")
