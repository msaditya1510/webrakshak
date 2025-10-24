import React, { useState, useEffect } from "react";

export default function RecentNewsSection() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  // Fetch recent headlines from The Hacker News via their RSS-to-JSON proxy
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Using a publicly available RSS to JSON converter API
        const response = await fetch(
          "https://api.rss2json.com/v1/api.json?rss_url=https://thehackernews.com/feeds/posts/default"
        );
        const data = await response.json();
        if (data.status === "ok") {
          // Extract first 8 news items and limit info to title, link
          const items = data.items.slice(0, 8).map(({ title, link, description }) => ({
            title,
            link,
            description,
          }));
          setNews(items);
        } else {
          setError("Failed to fetch news feed");
        }
      } catch (err) {
        setError("Error fetching news feed");
      }
    };
    fetchNews();
  }, []);

  return (
    <section
      style={{
        minHeight: "60vh",
        background: "#12131a",
        padding: "60px 20px",
        color: "white",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "24px" }}>
        Recent Phishing & Security News
      </h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!error && news.length === 0 && <p>Loading news...</p>}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: "16px",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        {news.map((item, idx) => (
          <a
            key={idx}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#1a1a1a",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 6px 16px rgba(0,255,255,0.2)",
              color: "#00ffff",
              textDecoration: "none",
              textAlign: "left",
            }}
          >
            <h3 style={{ marginBottom: "12px", fontSize: "1.2rem" }}>{item.title}</h3>
            <p
              style={{
                color: "#ccc",
                fontSize: "0.9rem",
                overflow: "hidden",
                maxHeight: "4.5em",
                lineHeight: "1.5em",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                marginBottom: 0,
              }}
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          </a>
        ))}
      </div>
      <p style={{ marginTop: "30px", color: "#666", fontSize: "0.85rem" }}>
        News source:{" "}
        <a
          href="https://thehackernews.com/?m=1"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#00ffff" }}
        >
          The Hacker News
        </a>
      </p>
    </section>
  );
}
