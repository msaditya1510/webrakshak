# 🛡️ Phishing Detector Extension

A Chrome extension that protects users from phishing attacks by scanning URLs in real-time and blocking malicious websites.

## ✨ Features

- Real-time URL scanning with VirusTotal API
- Automatic blocking of malicious websites
- Smart whitelisting for trusted domains
- User-friendly warning pages
- Caution alerts for unknown sites

## 🚀 Setup

1. Clone repo
2. Replace `YOUR_VIRUSTOTAL_API_KEY_HERE` in `background.js` with your actual VirusTotal API key
3. Load extension in Chrome (`chrome://extensions/` → Developer mode → Load unpacked)

## 🔧 How It Works

1. **Safe sites** → Load instantly
2. **Unknown sites** → Show caution page with countdown
3. **Malicious sites** → Completely blocked