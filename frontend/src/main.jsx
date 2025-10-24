import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import App from "./App.jsx";
import URLScan from "./pages/URLScan.jsx";
import EmailScan from "./pages/EmailScan.jsx";
import ImageScan from "./pages/ImageScan.jsx";
import VoiceScan from "./pages/VoiceScan.jsx";

import SecuritySection from "./components/SecuritySection.jsx"; // <-- Added
import RecentNewsSection from "./components/RecentNewsSection.jsx";
import VotePhishSection from "./components/VotePhishSection.jsx";
import ContactUs from "./components/ContactUs.jsx";

import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<App />} />

        {/* Scan pages */}
        <Route path="/url-scan" element={<URLScan />} />
        <Route path="/email-scan" element={<EmailScan />} />
        <Route path="/image-scan" element={<ImageScan />} />
        <Route path="/voice-scan" element={<VoiceScan />} />

        {/* SecuritySection dedicated route */}
        <Route path="/security-tools" element={<SecuritySection />} />

        {/* Other pages */}
        <Route path="/recent-news" element={<RecentNewsSection />} />
        <Route path="/vote-phish" element={<VotePhishSection />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
