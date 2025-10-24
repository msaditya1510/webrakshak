import React, { useState } from "react";

export default function EmailScan() {
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    if (!emailText) return;
    // const res = await fetch("https://webrakshak.onrender.com/api/scan_email", {
    const res = await fetch("https://cryptchat2.onrender.com/api/scan_email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: emailText }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="scan-page">
      <h2>📧 Email Scan</h2>
      <textarea
        placeholder="Paste email content here..."
        rows="6"
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
      />
      <button onClick={handleScan}>Scan Email</button>
      {result && (
        <div className="result-card">
          <p><b>Status:</b> {result.result}</p>
          <p><b>Confidence:</b> {result.confidence}%</p>
        </div>
      )}
    </div>
  );
}
