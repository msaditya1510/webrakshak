import React from "react";

export default function MetricsOverview() {
  return (
    <section
      style={{
        background: "#0A0C14",
        padding: "40px 20px",
        color: "white",
        display: "flex",
        justifyContent: "center",
        gap: "60px",
        flexWrap: "wrap",
        textAlign: "center",
        marginTop: 60,
        borderRadius: 12,
        maxWidth: 960,
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "0 12px 36px rgba(0,255,255,0.25)",
      }}
    >
      <div>
        <h3 style={{ fontSize: "3rem", fontWeight: "bold", margin: 0 }}>
          3,024,841
        </h3>
        <p style={{ fontSize: "1.25rem", opacity: 0.7 }}>
          Scans in the Last 24 Hours
        </p>
      </div>
      <div>
        <h3 style={{ fontSize: "3rem", fontWeight: "bold", margin: 0 }}>
          48,554
        </h3>
        <p style={{ fontSize: "1.25rem", opacity: 0.7 }}>Active Users</p>
      </div>
      <div>
        <h3 style={{ fontSize: "3rem", fontWeight: "bold", margin: 0 }}>
          8,084
        </h3>
        <p style={{ fontSize: "1.25rem", opacity: 0.7 }}>
          Active Organizations
        </p>
      </div>
    </section>
  );
}
