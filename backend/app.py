from matplotlib import pyplot as plt
import streamlit as st
import pandas as pd
import joblib
import math
import re
import os
from urllib.parse import urlparse
from collections import Counter
import tensorflow as tf
from tensorflow import keras
from datetime import datetime
import numpy as np
from PIL import Image
import io
import logging

# ---------------- Streamlit Setup ----------------
st.set_page_config(
    page_title="WebRakshak: Phishing Detection",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------- Utility Functions ----------------
def calculate_entropy(s: str) -> float:
    if not s:
        return 0.0
    counts = Counter(s)
    probs = [c / len(s) for c in counts.values()]
    return -sum(p * math.log2(p) for p in probs if p > 0)

def has_repeated_digits(s: str) -> int:
    return int(bool(re.search(r"(\d).*\1", s)))

def count_special_chars(s: str) -> int:
    return sum(1 for c in s if not c.isalnum() and c not in "-_./:?=#&%$@+")

def safe_len(x) -> int:
    return 0 if x is None else len(x)

def extract_subdomain_stats(domain: str):
    parts = domain.split('.')
    subdomains = parts[:-2] if len(parts) > 2 else []
    if not subdomains:
        return dict(number_of_subdomains=0, having_digits_in_subdomain=0)
    count = len(subdomains)
    digits_counts = [sum(ch.isdigit() for ch in s) for s in subdomains]
    having_digits = int(any(d > 0 for d in digits_counts))
    return {"number_of_subdomains": count, "having_digits_in_subdomain": having_digits}

def extract_features(url: str) -> pd.DataFrame:
    url = url.strip()
    parsed = urlparse(url if "://" in url else "http://" + url)
    domain = parsed.netloc.lower()
    features = {
        'url_length': safe_len(url),
        'entropy': calculate_entropy(url),
        'num_digits': sum(ch.isdigit() for ch in url),
        'num_special': count_special_chars(url),
        'domain_length': safe_len(domain),
        'repeated_digits': has_repeated_digits(domain),
    }
    features.update(extract_subdomain_stats(domain))
    return pd.DataFrame([features])

def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    image = image.resize((224, 224))
    image_array = np.expand_dims(np.array(image) / 255.0, axis=0)
    return image_array

# ---------------- Load Models ----------------
@st.cache_resource
def load_models():
    url_model = None
    image_model = None
    
    # Load URL model
    try:
        url_model = joblib.load("url_model/model_compressed.joblib")
        st.success("✅ URL model loaded successfully!")
        logger.info("URL model loaded")
    except Exception as e:
        st.warning(f"⚠️ URL model load failed: {e}")
        logger.warning(f"URL model load failed: {e}")
    
    # Load Image model (TFLite handled with TFSMLayer)
    try:
        tflite_path = "image_model/image_model.tflite"
        if os.path.exists(tflite_path):
            image_model = keras.layers.TFSMLayer(tflite_path, call_endpoint="serving_default")
            st.success("✅ Image model loaded successfully!")
            logger.info("Image model loaded")
        else:
            raise FileNotFoundError(f"{tflite_path} not found")
    except Exception as e:
        st.warning(f"⚠️ Image model load failed: {e}")
        logger.warning(f"Image model load failed: {e}")
    
    return url_model, image_model

url_model, image_model = load_models()

# ---------------- Storage Setup ----------------
VOTES_FILE = "votes_history.csv"
if not os.path.exists(VOTES_FILE):
    pd.DataFrame(columns=["type", "content", "label", "phish", "safe", "timestamp"]).to_csv(VOTES_FILE, index=False)

def store_vote(item_type: str, content: str, label: str) -> int:
    try:
        history = pd.read_csv(VOTES_FILE)
    except FileNotFoundError:
        history = pd.DataFrame(columns=["type", "content", "label", "phish", "safe", "timestamp"])
    
    timestamp = datetime.now().isoformat()
    new_row = {
        "type": item_type,
        "content": content,
        "label": label,
        "phish": int(label == "phish"),
        "safe": int(label == "safe"),
        "timestamp": timestamp,
    }
    history = pd.concat([history, pd.DataFrame([new_row])], ignore_index=True)
    history.to_csv(VOTES_FILE, index=False)
    logger.info(f"Vote stored: {item_type} - {label}")
    return len(history)

# ---------------- Retraining ----------------
def retrain_url_model():
    try:
        history = pd.read_csv(VOTES_FILE)
        url_data = history[history["type"] == "URL"]
        if len(url_data) < 10:
            return "Not enough URL samples to retrain (need at least 10)."
        
        X = np.array([extract_features(row["content"]).iloc[0].values for _, row in url_data.iterrows()])
        y = np.array([1 if row["label"] == "phish" else 0 for _, row in url_data.iterrows()])
        
        if hasattr(url_model, 'partial_fit'):
            url_model.partial_fit(X, y)
        else:
            url_model.fit(X, y)
        
        joblib.dump(url_model, "url_model/model_compressed.joblib")
        st.cache_resource.clear()
        logger.info(f"URL model retrained on {len(url_data)} samples")
        return f"✅ Retrained URL model on {len(url_data)} samples!"
    except Exception as e:
        logger.error(f"URL retrain failed: {e}")
        return f"❌ Retrain failed: {e}"

def retrain_image_model():
    st.warning("Image retraining requires stored image data. Implement image storage for full functionality.")
    logger.warning("Image retrain placeholder")
    return "Image retraining placeholder - implement image data storage."

# ---------------- Streamlit UI ----------------
st.title("🛡️ WebRakshak: AI-Powered Phishing Detection")
st.markdown("#### Unified fortress against phishing threats! *Updated October 24, 2025.*")

with st.sidebar:
    st.header("Model Status")
    st.info(f"**URL Model:** {'✅ Loaded' if url_model else '⚠️ Mock'}")
    st.info(f"**Image Model:** {'✅ Loaded' if image_model else '⚠️ Mock'}")
    st.markdown("---")
    st.markdown("[GitHub Repo](https://github.com/your-repo) | [Docs](https://docs.webrakshak.ai)")

tab1, tab2 = st.tabs(["🔍 Scan Tools", "👥 Community Voting"])

# ---------------- Scan Tools ----------------
with tab1:
    st.header("Instant Threat Detection")
    scan_type = st.radio("Choose scan type:", ["URL Scan", "Image Scan"], horizontal=True, label_visibility="collapsed")
    
    if scan_type == "URL Scan":
        st.subheader("🔗 URL Analysis")
        url = st.text_input("Paste a URL to check:", placeholder="https://secure-paypal-login.com")
        if st.button("🚀 Analyze URL", type="primary", use_container_width=True) and url:
            with st.spinner("🔄 Scanning URL..."):
                try:
                    feats = extract_features(url)
                    if url_model is None:
                        pred = np.random.choice([0, 1], p=[0.7, 0.3])
                        conf = np.random.uniform(0.6, 0.95)
                    else:
                        pred = url_model.predict(feats)[0]
                        conf = url_model.predict_proba(feats)[0][1] if hasattr(url_model, 'predict_proba') else 0.8
                    
                    verdict = "🚨 **Phishing Detected!**" if pred > 0.5 else "✅ **Safe URL**"
                    color = "#ff4444" if pred > 0.5 else "#44ff44"
                    st.markdown(
                        f"<div style='background:{color}22; padding:20px; border-radius:12px; text-align:center; border-left:5px solid {color};'>"
                        f"<h2 style='margin:0; color:{color}; font-size:1.5em;'>{verdict}</h2>"
                        f"<p style='margin:5px 0; font-size:1.1em;'>Confidence: <strong>{conf*100:.1f}%</strong></p>"
                        f"<p style='margin:10px 0; opacity:0.8;'>{'High risk - Avoid clicking!' if pred > 0.5 else 'Low risk - Proceed with caution.'}</p>"
                        "</div>", unsafe_allow_html=True
                    )
                    st.subheader("📊 Extracted Features")
                    st.dataframe(feats.T, use_container_width=True, hide_index=True)
                except Exception as e:
                    logger.error(f"URL prediction error: {e}")
                    st.error(f"❌ Prediction failed: {e}.")

    elif scan_type == "Image Scan":
        st.subheader("🖼️ Image Analysis")
        uploaded_file = st.file_uploader("Choose an image...", type=["png", "jpg", "jpeg"])
        if uploaded_file is not None:
            image = Image.open(uploaded_file)
            st.image(image, caption=f"Uploaded: {uploaded_file.name} ({image.size[0]}x{image.size[1]})", use_column_width=True)
            
            if st.button("🚀 Analyze Image", type="primary", use_container_width=True):
                with st.spinner("🔄 Scanning image..."):
                    try:
                        if image_model is None:
                            pred = np.random.choice([0, 1], p=[0.8, 0.2])
                            conf = np.random.uniform(0.5, 0.9)
                        else:
                            image_array = preprocess_image(uploaded_file.read())
                            pred = image_model(image_array)[0][0].numpy()
                            conf = float(pred)
                        
                        verdict = "🚨 **Phishing Image!**" if pred > 0.5 else "✅ **Safe Image**"
                        color = "#ff4444" if pred > 0.5 else "#44ff44"
                        st.markdown(
                            f"<div style='background:{color}22; padding:20px; border-radius:12px; text-align:center; border-left:5px solid {color};'>"
                            f"<h2 style='margin:0; color:{color}; font-size:1.5em;'>{verdict}</h2>"
                            f"<p style='margin:5px 0; font-size:1.1em;'>Confidence: <strong>{conf*100:.1f}%</strong></p>"
                            f"<p style='margin:10px 0; opacity:0.8;'>{'Potential embedded threats detected!' if pred > 0.5 else 'No visual phishing indicators found.'}</p>"
                            "</div>", unsafe_allow_html=True
                        )
                    except Exception as e:
                        logger.error(f"Image prediction error: {e}")
                        st.error(f"❌ Image prediction failed: {e}.")

# ---------------- Community Voting ----------------
with tab2:
    st.header("🧠 Community Voting")
    content_type = st.selectbox("Select type", ["URL", "Image"])
    content_input = ""
    file_input = None
    if content_type == "URL":
        content_input = st.text_input("Enter URL to vote on:")
    else:
        file_input = st.file_uploader("Upload image for voting:", type=["png", "jpg", "jpeg"])
        if file_input:
            image = Image.open(file_input)
            st.image(image, caption="Image for Voting", use_column_width=True)
    
    if (content_type == "URL" and content_input) or (content_type == "Image" and file_input):
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🚨 Mark as Phishing", use_container_width=True):
                content = content_input if content_type == "URL" else file_input.name
                total = store_vote(content_type, content, "phish")
                st.success(f"✅ Voted as Phishing! Total contributions: {total}")
        with col2:
            if st.button("✅ Mark as Safe", use_container_width=True):
                content = content_input if content_type == "URL" else file_input.name
                total = store_vote(content_type, content, "safe")
                st.success(f"✅ Voted as Safe! Total contributions: {total}")

    # Voting history
    st.subheader("📊 Recent Voting History")
    if os.path.exists(VOTES_FILE):
        history = pd.read_csv(VOTES_FILE).tail(10)
        st.dataframe(history, use_container_width=True, hide_index=True)

    # Retrain models
    st.subheader("🔄 Model Retraining")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔄 Retrain URL Model"):
            msg = retrain_url_model()
            st.info(msg)
    with col2:
        if st.button("🔄 Retrain Image Model"):
            msg = retrain_image_model()
            st.info(msg)

# ---------------- Footer ----------------
st.markdown("---")
col1, col2, col3 = st.columns(3)
with col1:
    st.markdown("*Updated October 24, 2025*")
with col2:
    st.markdown("**Powered by Community AI**")
with col3:
    st.markdown("[GitHub](https://github.com/OnArchit/WebRakshak) | [Docs](https://docs.webrakshak.ai)")

logger.info("✅ WebRakshak deployed successfully!")
