import React, { useState, useEffect } from "react";

export default function VotePhishSection() {
  const [items, setItems] = useState([]); // Items with url/image, votes, label
  const [inputUrl, setInputUrl] = useState("");
  const [inputFile, setInputFile] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch recent vote items from backend on mount
  useEffect(() => {
    //fetch("https://webrakshak.onrender.com/api/history")
    fetch("https://cryptchat2.onrender.com/api/history")
      .then((res) => res.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  // Submit new URL or image filename for voting
  const handleSubmit = async () => {
    if (!inputUrl && !inputFile) {
      setMessage("Please input a URL or select a file.");
      return;
    }
    const newItem = {
      type: inputFile ? "Image" : "URL",
      content: inputFile ? inputFile.name : inputUrl,
      label: "unvoted",
      votes: { phish: 0, safe: 0 },
    };
    setItems((prev) => [newItem, ...prev]);
    setInputUrl("");
    setInputFile(null);
    setMessage("Submitted! Waiting for votes...");
    // await fetch("https://webrakshak.onrender.com//api/store_vote", {
    await fetch("https://cryptchat2.onrender.com/api/store_vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
  };

  // Cast vote on item at index
  const handleVote = async (index, voteType) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              votes: {
                ...item.votes,
                [voteType]: item.votes[voteType] + 1,
              },
              label: voteType,
            }
          : item
      )
    );
    //await fetch("https://webrakshak.onrender.com/api/store_vote", {
    await fetch("https://cryptchat2.onrender.com/api/store_vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...items[index], label: voteType }),
    });
    setMessage(`Voted ${voteType} ✅`);
  };

  // Automatically trigger retrain request if >10 votes
  useEffect(() => {
    if (items.length > 10) {
      //fetch("https://webrakshak.onrender.com/api/retrain", { method: "POST" })
      fetch("https://cryptchat2.onrender.com/api/retrain", { method: "POST" })
        .then((res) => res.json())
        .then((data) => setMessage(data.status));
    }
  }, [items]);

  return (
    <section style={{ padding: 20, maxWidth: 800, margin: "auto", color: "white" }}>
      <h2 style={{ fontSize: 28, marginBottom: 16 }}>Community Phish Vote</h2>
      <p style={{ marginBottom: 20 }}>
        Submit URLs or images and vote to help train our models in real time.
      </p>

      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Paste URL here"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          style={{ padding: "10px", flex: 1, minWidth: 220, borderRadius: 4, border: "1px solid #333" }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setInputFile(e.target.files[0])}
          style={{ color: "#fff" }}
        />
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: "#00ffff",
            border: "none",
            padding: "0 24px",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </div>
      {message && <p style={{ color: "lime", marginBottom: 16 }}>{message}</p>}

      <div style={{ maxHeight: 300, overflowY: "auto" }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#111",
              padding: 12,
              marginBottom: 10,
              borderRadius: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <b>{item.type}:</b> {item.content}
              <p style={{ margin: "6px 0" }}>
                Votes — Phish ({item.votes.phish}) | Safe ({item.votes.safe})
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleVote(idx, "phish")}
                style={{
                  backgroundColor: "#ff007f",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  fontWeight: "bold",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Phish
              </button>
              <button
                onClick={() => handleVote(idx, "safe")}
                style={{
                  backgroundColor: "#00ffff",
                  border: "none",
                  borderRadius: 6,
                  color: "#0A0C14",
                  fontWeight: "bold",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Safe
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
