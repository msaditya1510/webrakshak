import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./style.css"; // Import your frosted-metallic theme CSS

// Optional: A simple preloader fade-out
const Preloader = () => (
  <div className="preloader" id="preloader">
    <div className="loader-ring"></div>
  </div>
);

const RootApp = () => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) preloader.style.opacity = "0";
      setTimeout(() => preloader?.remove(), 600);
    }, 1500); // Hide preloader after 1.5s
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Preloader />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RootApp />);
