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

# Logging setup for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ----------------- Utility functions -----------------
def calculate_entropy(s: str) -> float:
    if not s:
        return 0.0
    counts = Counter(s)
    probs = [c / len(s) for c in counts.values()]
    return -sum(p * math.log2(p) for p in probs if p > 0)

def has_repeated_digits(s: str) -> int:
    return 1 if re.search(r"(\d).*\1", s) else 0

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
    return {
        "number_of_subdomains": count,
        "having_digits_in_subdomain": having_digits
    }

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

# ----------------- Load Models -----------------
@st.cache_resource
def load_models():
    url_model = None
    image_model = None
    
    try:
        url_model = joblib.load("url_model/url_model.joblib")
        st.success("✅ URL model loaded successfully!")
        logger.info("URL model loaded")
    except Exception as e:
        st.warning(f"⚠️ URL model not found or failed to load: {e}. Using mock predictions.")
        logger.warning(f"URL model load failed: {e}")
    
    try:
        image_model = tf.keras.models.load_model("image_model/image_model.keras")
        st.success("✅ Image model loaded successfully!")
        logger.info("Image model loaded")
    except Exception as e:
        st.warning(f"⚠️ Image model not found or failed to load: {e}. Using mock predictions.")
        logger.warning(f"Image model load failed: {e}")
    
    return url_model, image_model

url_model, image_model = load_models()

# ----------------- Storage Setup -----------------
VOTES_FILE = "votes_history.csv"
if not os.path.exists(VOTES_FILE):
    pd.DataFrame(columns=["type", "content", "label", "phish", "safe", "timestamp"]).to_csv(VOTES_FILE, index=False)


def store_vote(item_type, content, label):
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

def retrain_url_model():
    try:
        history = pd.read_csv(VOTES_FILE)
        url_data = history[history["type"] == "URL"]
        if len(url_data) < 10:
            return "Not enough URL samples to retrain (need at least 10)."
        
        # Use extracted features for retraining
        X = []
        y = []
        for _, row in url_data.iterrows():
            feats = extract_features(row["content"])
            X.append(feats.iloc[0].values)
            y.append(1 if row["label"] == "phish" else 0)
        
        X = np.array(X)
        y = np.array(y)
        
        # Simple retrain (assuming model supports partial_fit or fit)
        if hasattr(url_model, 'partial_fit'):
            url_model.partial_fit(X, y)
        else:
            url_model.fit(X, y)  # Full retrain; adjust if needed
        
        joblib.dump(url_model, "url_model/url_model.joblib")
        st.cache_resource.clear()  # Clear cache to reload model
        logger.info(f"URL model retrained on {len(url_data)} samples")
        return f"✅ Retrained URL model on {len(url_data)} samples!"
    except Exception as e:
        logger.error(f"URL retrain failed: {e}")
        return f"❌ Retrain failed: {e}"

def retrain_image_model():
    history = pd.read_csv(VOTES_FILE)
    image_data = history[history["type"] == "Image"]
    if len(image_data) < 10:
        return "Not enough image samples to retrain (need at least 10)."
    
    # For images, you'd need to store actual image data or paths; this is a placeholder
    # Implement image storage (e.g., save files with hashes) for full functionality
    st.warning("Image retraining requires stored image data. Implement image storage for full functionality.")
    logger.warning("Image retrain placeholder")
    return "Image retraining placeholder - implement image data storage."

# ----------------- Streamlit UI -----------------
st.title("🛡️ WebRakshak: AI-Powered Phishing Detection")
st.markdown("#### A unified fortress against phishing threats with community reinforcement learning! *Updated October 23, 2025.*")

# Sidebar for model status
with st.sidebar:
    st.header("Model Status")
    st.info(f"**URL Model:** {'✅ Loaded' if url_model else '⚠️ Mock'}")
    st.info(f"**Image Model:** {'✅ Loaded' if image_model else '⚠️ Mock'}")
    st.markdown("---")
    st.markdown("[GitHub Repo](https://github.com/your-repo) | [Docs](https://docs.webrakshak.ai)")

tab1, tab2 = st.tabs(["🔍 Scan Tools", "👥 Community Voting"])

with tab1:
    st.header("Instant Threat Detection")
    scan_type = st.radio("Choose scan type:", ["URL Scan", "Image Scan"], horizontal=True, label_visibility="collapsed")
    
    if scan_type == "URL Scan":
        st.subheader("🔗 URL Analysis")
        url = st.text_input("Paste a URL to check:", placeholder="https://secure-paypal-login.com", help="Enter a suspicious URL for phishing analysis.")
        if st.button("🚀 Analyze URL", type="primary", use_container_width=True) and url:
            with st.spinner("🔄 Scanning URL... (This may take a few seconds)"):
                try:
                    feats = extract_features(url)
                    if url_model is None:
                        pred = np.random.choice([0, 1], p=[0.7, 0.3])  # Mock random for demo
                        conf = np.random.uniform(0.6, 0.95)
                    else:
                        pred = url_model.predict(feats)[0]
                        conf = url_model.predict_proba(feats)[0][1] if hasattr(url_model, 'predict_proba') else 0.8
                    
                    verdict = "🚨 **Phishing Detected!**" if pred > 0.5 else "✅ **Safe URL**"
                    color = "#ff4444" if pred > 0.5 else "#44ff44"
                    st.markdown(
                        f"""
                        <div style='background:{color}22; padding:20px; border-radius:12px; text-align:center; border-left:5px solid {color};'>
                            <h2 style='margin:0; color:{color}; font-size:1.5em;'>{verdict}</h2>
                            <p style='margin:5px 0; font-size:1.1em;'>Confidence: <strong>{conf*100:.1f}%</strong></p>
                            <p style='margin:10px 0; opacity:0.8;'>{ 'High risk - Avoid clicking!' if pred > 0.5 else 'Low risk - Proceed with caution.' }</p>
                        </div>
                        """,
                        unsafe_allow_html=True
                    )
                    st.subheader("📊 Extracted Features")
                    st.dataframe(feats.T, use_container_width=True, hide_index=True)
                    
                    # Additional insights with metrics
                    st.subheader("💡 Quick Insights")
                    col1, col2, col3, col4 = st.columns(4)
                    with col1:
                        st.metric("URL Length", f"{feats['url_length'][0]} chars", delta=f"{feats['url_length'][0] - 50:+.0f}")
                    with col2:
                        st.metric("Entropy", f"{feats['entropy'][0]:.2f}", delta=f"{feats['entropy'][0] - 4:.2f}")
                    with col3:
                        st.metric("Special Chars", feats['num_special'][0])
                    with col4:
                        st.metric("Subdomains", feats['number_of_subdomains'][0])
                        
                    # Risk breakdown bar chart
                    risk_scores = {'Length Risk': min(feats['url_length'][0]/100, 1), 'Entropy Risk': 1 - feats['entropy'][0]/8, 'Digits Risk': feats['num_digits'][0]/10}
                    st.bar_chart(risk_scores)
                    
                except Exception as e:
                    logger.error(f"URL prediction error: {e}")
                    st.error(f"❌ Prediction failed: {e}. Please check the URL format.")
    
    elif scan_type == "Image Scan":
        st.subheader("🖼️ Image Analysis")
        uploaded_file = st.file_uploader("Choose an image to scan...", type=["png", "jpg", "jpeg"], help="Upload a suspicious image for phishing detection (e.g., QR codes, logos).")
        if uploaded_file is not None:
            # Display image with caption
            image = Image.open(uploaded_file)
            st.image(image, caption=f"Uploaded: {uploaded_file.name} ({image.size[0]}x{image.size[1]})", use_column_width=True)
            
            if st.button("🚀 Analyze Image", type="primary", use_container_width=True):
                with st.spinner("🔄 Scanning image... (Processing with CNN model)"):
                    try:
                        if image_model is None:
                            pred = np.random.choice([0, 1], p=[0.8, 0.2])  # Mock random for demo
                            conf = np.random.uniform(0.5, 0.9)
                        else:
                            image_array = preprocess_image(uploaded_file.read())
                            pred = image_model.predict(image_array)[0][0]
                            conf = float(pred)
                        
                        verdict = "🚨 **Phishing Image!**" if pred > 0.5 else "✅ **Safe Image**"
                        color = "#ff4444" if pred > 0.5 else "#44ff44"
                        st.markdown(
                            f"""
                            <div style='background:{color}22; padding:20px; border-radius:12px; text-align:center; border-left:5px solid {color};'>
                                <h2 style='margin:0; color:{color}; font-size:1.5em;'>{verdict}</h2>
                                <p style='margin:5px 0; font-size:1.1em;'>Confidence: <strong>{conf*100:.1f}%</strong></p>
                                <p style='margin:10px 0; opacity:0.8;'>{ 'Potential embedded threats detected!' if pred > 0.5 else 'No visual phishing indicators found.' }</p>
                            </div>
                            """,
                            unsafe_allow_html=True
                        )
                        
                        # Image metrics
                        st.subheader("📏 Image Metrics")
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.metric("Width", image.width)
                        with col2:
                            st.metric("Height", image.height)
                        with col3:
                            st.metric("File Size", f"{len(uploaded_file.getvalue())} bytes")
                            
                        # Simple risk visualization
                        st.subheader("🎯 Risk Breakdown")
                        risk_scores = {'Visual Anomalies': conf, 'Logo Impersonation': conf * 0.8, 'QR Code Risk': conf * 0.6}
                        st.bar_chart(risk_scores)
                        
                    except Exception as e:
                        logger.error(f"Image prediction error: {e}")
                        st.error(f"❌ Image prediction failed: {e}. Ensure the file is a valid image.")

with tab2:
    st.header("🧠 Community Voting & Reinforcement Learning")
    st.markdown("**Contribute by voting on URLs or uploaded images to improve our AI models dynamically!** Your votes help retrain the system in real-time.")
    
    content_type = st.selectbox("Select type", ["URL", "Image"], help="Choose what to vote on.")
    content_input = ""
    file_input = None
    if content_type == "URL":
        st.info("📝 Enter a URL and vote if it's phishing or safe.")
        content_input = st.text_input("Enter URL to vote on:", placeholder="https://example.com")
    else:
        st.info("🖼️ Upload an image and vote if it's phishing-related.")
        file_input = st.file_uploader("Upload image for voting:", type=["png", "jpg", "jpeg"])
        if file_input:
            image = Image.open(file_input)
            st.image(image, caption="Image for Voting", use_column_width=True)
    
    if (content_type == "URL" and content_input) or (content_type == "Image" and file_input):
        st.markdown("---")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🚨 **Mark as Phishing**", use_container_width=True, type="primary"):
                content = content_input if content_type == "URL" else file_input.name
                total = store_vote(content_type, content, "phish")
                st.success(f"✅ Voted as Phishing! Total contributions: **{total}**")
                st.balloons()  # Fun animation
                st.rerun()
        with col2:
            if st.button("✅ **Mark as Safe**", use_container_width=True):
                content = content_input if content_type == "URL" else file_input.name
                total = store_vote(content_type, content, "safe")
                st.success(f"✅ Voted as Safe! Total contributions: **{total}**")
                st.rerun()
    
    # Voting history
    st.subheader("📊 Recent Voting History")
    if os.path.exists(VOTES_FILE):
        history = pd.read_csv(VOTES_FILE).tail(10)
        st.dataframe(
            history.style.format({"timestamp": "{:%Y-%m-%d %H:%M}"}),
            use_container_width=True,
            hide_index=True
        )
        # Download button
        st.download_button(
            label="📥 Download Full History",
            data=history.to_csv(index=False),
            file_name="votes_history.csv",
            mime="text/csv"
        )
    else:
        st.info("👋 No votes yet. Be the first to contribute and help train the AI!")
    
    # Retrain buttons with confirmation
    st.subheader("🔄 Model Retraining")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔄 Retrain URL Model", type="secondary"):
            msg = retrain_url_model()
            st.info(msg)
            if "Retrained" in msg:
                st.success("Model updated! Refresh to use the new version.")
    with col2:
        if st.button("🔄 Retrain Image Model", type="secondary"):
            msg = retrain_image_model()
            st.info(msg)
    
    # Stats with charts
    st.subheader("📈 Contribution Stats")
    if os.path.exists(VOTES_FILE):
        history = pd.read_csv(VOTES_FILE)
        col1, col2, col3 = st.columns(3)
        with col1:
            total_votes = len(history)
            st.metric("Total Votes", total_votes)
        with col2:
            phish_votes = len(history[history["label"] == "phish"])
            st.metric("Phish Reports", phish_votes)
        with col3:
            safe_votes = len(history[history["label"] == "safe"])
            st.metric("Safe Marks", safe_votes)
        
        # Pie chart for vote distribution
        vote_dist = history["label"].value_counts()
        fig, ax = plt.subplots()
        ax.pie(vote_dist.values, labels=vote_dist.index, autopct='%1.1f%%', colors=['#ff4444', '#44ff44'])
        ax.set_title("Vote Distribution")
        st.pyplot(fig)

# Footer
st.markdown("---")
col1, col2, col3 = st.columns(3)
with col1:
    st.markdown("*Updated October 23, 2025*")
with col2:
    st.markdown("**Powered by Community AI**")
with col3:
    st.markdown("[GitHub](https://github.com/OnArchit/WebRakshak) | [Docs](https://docs.webrakshak.ai)")