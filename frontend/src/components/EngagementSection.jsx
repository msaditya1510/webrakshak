import React, { useState } from "react";

export default function EngagementSection() {
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [badge, setBadge] = useState(null);
  const [points, setPoints] = useState(0);

  const handleChallenge = () => {
    setChallengeComplete(true);
    setPoints((prev) => prev + 10);
    setBadge("🛡️ Phish Hunter Badge");
  };

  return (
    <section
      style={{
        minHeight: "80vh",
        background: "#12131a",
        padding: "60px 20px",
        textAlign: "center",
        color: "white",
      }}
    >
      <h2 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: 10 }}>Engage & Learn</h2>
      <p style={{ color: "#aaa", fontSize: 18, maxWidth: 700, margin: "0 auto 40px" }}>
        Sharpen your cybersecurity skills while earning badges through interactive challenges.
      </p>

      <div
        style={{
          background: "#1a1a1a",
          maxWidth: 600,
          margin: "auto",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 6px 16px rgba(0,255,255,0.2)",
        }}
      >
        <h3>Mini Phishing Challenge</h3>
        <p style={{ marginBottom: 8 }}>
          Identify whether this email is phishing or safe:
        </p>
        <div
          style={{
            background: "#0c101a",
            borderRadius: 8,
            padding: 16,
            color: "#00ffff",
            marginBottom: 20,
          }}
        >
          From: support@paypal-security.com <br />
          Subject: Urgent! Verify your account <br />
          Body: Click the link below to restore access immediately.
        </div>
        {!challengeComplete ? (
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button
              onClick={handleChallenge}
              style={{
                background: "linear-gradient(90deg,#00ffff,#7b5cf5)",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                fontWeight: "bold",
                color: "#0A0C14",
              }}
            >
              Phishing
            </button>
            <button
              onClick={handleChallenge}
              style={{
                background: "linear-gradient(90deg,#ff00ff,#ff7b00)",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                fontWeight: "bold",
                color: "#0A0C14",
              }}
            >
              Safe
            </button>
          </div>
        ) : (
          <p style={{ color: "#00ffff" }}>
            ✅ Challenge Completed! You earned 10 points!
          </p>
        )}
      </div>

      {badge && (
        <div
          style={{
            marginTop: 40,
            background: "#1a1a1a",
            padding: 20,
            borderRadius: 16,
            boxShadow: "0 6px 16px rgba(255,255,0,0.2)",
            maxWidth: 400,
            margin: "40px auto 0",
          }}
        >
          <h3>Achievements</h3>
          <p>{badge}</p>
          <p>Total Points: {points}</p>
        </div>
      )}
    </section>
  );
}
