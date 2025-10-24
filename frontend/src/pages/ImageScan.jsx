import React, { useState } from "react";

export default function ImageScan() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = "https://webrakshak.onrender.com/"; // FastAPI backend

  const handleScan = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BACKEND_URL}/scan_image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to scan image. Make sure backend is running.");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error scanning file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto", color: "#fff" }}>
      <h2 style={{ marginBottom: 16 }}>🖼 Image / File Scan</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        style={{
          marginBottom: 12,
          padding: 8,
          borderRadius: 6,
          border: "1px solid #333",
          width: "100%",
          background: "#0a0c14",
          color: "white",
        }}
      />

      {file && file.type.startsWith("image/") && (
        <div style={{ marginBottom: 12 }}>
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 8 }}
          />
        </div>
      )}

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
