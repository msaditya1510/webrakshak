import React, { useState } from "react";

export default function VoiceScan() {
  const [audio, setAudio] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!audio) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", audio);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/scan_voice", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="scan-page">
      <h2>🎙 Voice Scan</h2>
      <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} />
      <button onClick={handleScan}>Analyze Voice</button>
      {loading && <p>Analyzing...</p>}
      {result && (
        <div className="result-card">
          <p><b>Status:</b> {result.result}</p>
          <p><b>Confidence:</b> {result.confidence}%</p>
        </div>
      )}
    </div>
  );
}
