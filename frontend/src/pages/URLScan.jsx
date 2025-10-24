import React, { useState } from "react";

export default function URLScan() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = "https://webrakshak.onrender.com/"; // FastAPI backend

  const handleScan = async () => {
    if (!url) {
      setError("Please enter a URL first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/scan_url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("Failed to scan URL. Make sure backend is running.");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error scanning URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto", color: "#fff" }}>
      <h2 style={{ marginBottom: 16 }}>🔍 URL Scan</h2>

      <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          marginBottom: 12,
          padding: 10,
          borderRadius: 6,
          border: "1px solid #333",
          width: "100%",
          background: "#0a0c14",
          color: "white",
        }}
      />

      <button
        onClick={handleScan}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          background: "linear-gradient(90deg,#00ffff,#7b5cf5)",
          color: "#0A0C14",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        {loading ? "Scanning..." : "Scan"}
      </button>

      {error && <p style={{ color: "#ff5555", marginBottom: 12 }}>{error}</p>}

      {result && (
        <div
          style={{
            background: "#1a1a1a",
            padding: 16,
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(0,255,255,0.2)",
          }}
        >
          <p><b>Status:</b> {result.result}</p>
          <p><b>Confidence:</b> {Math.round(result.confidence)}%</p>
          {result.details && (
            <div style={{ marginTop: 12 }}>
              <b>Details:</b>
              <ul>
                {result.details.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
