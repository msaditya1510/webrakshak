import React, { useState } from "react";

//const BACKEND_URL = "https://webrakshak.onrender.com/"; // FastAPI backend URL
const BACKEND_URL = "https://cryptchat2.onrender.com"; // FastAPI backend URL

export default function SecuritySection() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleScan = async (type) => {
    setLoading(true);
    setScanResult(null);
    try {
      let response;
      if (type === "URL") {
        response = await fetch(`${BACKEND_URL}/scan_url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
      } else if (type === "Email") {
        response = await fetch(`${BACKEND_URL}/scan_email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } else if (type === "Image") {
        if (!imageFile) {
          alert("Please select an image");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", imageFile);
        response = await fetch(`${BACKEND_URL}/scan_image`, {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();
      // Assuming backend returns { score: 85, details: [{reason, confidence}, ...] }
      setScanResult({ type, details: data.details || [] });
      setScore(data.score || 0);
    } catch (err) {
      setScanResult({ type, details: [{ reason: err.message || "Error scanning", confidence: 0 }] });
      setScore(0);
    }
    setLoading(false);
  };

  return (
    <section
      style={{
        background: "#0A0C14",
        padding: "80px 20px",
        minHeight: "100vh",
        textAlign: "center",
        color: "white",
      }}
    >
      <h2 style={{ fontSize: "3rem", marginBottom: "10px" }}>Security Tools</h2>
      <p style={{ fontSize: "1.2rem", color: "#bbb", marginBottom: "40px" }}>
        Scan URLs, emails, and images instantly for phishing or malware detection.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {["URL", "Email", "Image"].map((type, idx) => (
          <ScanCard
            key={idx}
            type={type}
            handleScan={() => handleScan(type)}
            loading={loading}
            stateControls={{ url, setUrl, email, setEmail, imageFile, setImageFile }}
          />
        ))}
      </div>

      {scanResult && (
        <div
          style={{
            marginTop: 50,
            maxWidth: 800,
            background: "#111827",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 8px 16px rgba(0,255,255,0.2)",
          }}
        >
          <h3 style={{ color: "#00ffff" }}>Scan Result ({scanResult.type})</h3>
          <p>
            <strong>Score:</strong> {score}/100
          </p>
          <ul style={{ textAlign: "left" }}>
            {scanResult.details.map((d, i) => (
              <li key={i}>
                {d.reason} — Confidence: {Math.round(d.confidence * 100)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

const ScanCard = ({ type, handleScan, loading, stateControls }) => {
  const { url, setUrl, email, setEmail, imageFile, setImageFile } = stateControls;
  const colors = { URL: "#00ffff", Email: "#ff00ff", Image: "#FFA500" };

  return (
    <div
      style={{
        background: "#1a1a1a",
        borderRadius: "16px",
        padding: 24,
        width: 300,
        boxShadow: `0 6px 18px ${colors[type]}55`,
      }}
    >
      <h3
        style={{
          background: `linear-gradient(90deg,${colors[type]},#fff)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {type} Scan
      </h3>

      {type === "URL" && (
        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ padding: 10, width: "100%", borderRadius: 8, marginBottom: 10 }}
        />
      )}

      {type === "Email" && (
        <input
          type="text"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, width: "100%", borderRadius: 8, marginBottom: 10 }}
        />
      )}

      {type === "Image" && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          style={{ width: "100%", marginBottom: 10 }}
        />
      )}

      <button
        onClick={handleScan}
        disabled={loading}
        style={{
          background: `linear-gradient(90deg,${colors[type]},#fff)`,
          border: "none",
          padding: "10px 20px",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          color: "#0A0C14",
          fontWeight: "bold",
          width: "100%",
        }}
      >
        {loading ? "Scanning..." : "Scan"}
      </button>
    </div>
  );
};
