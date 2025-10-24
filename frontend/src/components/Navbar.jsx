import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="logo">🔒 WebRakshak</span>
      </div>
      <div className="nav-right">
        <Link to="/">Home</Link>
        <Link to="/url-scan">URL Scan</Link>
        <Link to="/image-scan">Image/File Scan</Link>
        <Link to="/email-scan">Email Scan</Link>
        <Link to="/voice-scan">Voice Scan</Link>
      </div>
    </nav>
  );
}
