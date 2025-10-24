import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Html, OrbitControls, Environment } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import EngagementSection from "./components/EngagementSection.jsx";
import VotePhishSection from "./components/VotePhishSection.jsx";
import RecentNewsSection from "./components/RecentNewsSection.jsx";
import MetricsOverview from "./components/MetricsOverview.jsx";
import ContactUs from "./components/ContactUs.jsx";
import logo1 from "/logo1.png";
import { motion } from "framer-motion";
import "./style.css";

// ---------------- Navbar ----------------
function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navButtons = [
    { name: "Home", path: "/" },
    { name: "URL Scan", path: "/url-scan" },
    { name: "Email Scan", path: "/email-scan" },
    { name: "Image Scan", path: "/image-scan" },
    { name: "Voice Scan", path: "/voice-scan" },
    { name: "Recent News", path: "/recent-news" },
    { name: "Vote Phish", path: "/vote-phish" },
    { name: "Contact Us", path: "/contact-us" },
  ];

  return (
    <nav
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-wrap items-center gap-4 px-4 py-2 rounded-full backdrop-blur-md shadow-md transition-colors duration-500"
      style={{
        width: "90vw",
        maxWidth: 1200,
        fontFamily: "'Public Sans', Arial, sans-serif",
        color: "white",
        userSelect: "none",
        backgroundColor: isScrolled ? "rgba(26,26,26,0.85)" : "transparent",
        border: isScrolled ? "1px solid rgba(255,255,255,0.1)" : "none",
      }}
    >
      <div
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={() => navigate("/")}
      >
        <img
          src={logo1}
          alt="WebRakshak Logo"
          style={{ width: 40, height: 40, borderRadius: 6 }}
          loading="lazy"
        />
        <motion.span
          style={{
            fontWeight: "900",
            fontSize: "1.5rem",
            background: "linear-gradient(90deg, #a855f7, #ffffff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          whileHover={{ filter: "drop-shadow(0 0 10px #c084fc)" }}
          transition={{ duration: 0.3 }}
        >
          WebRakshak
        </motion.span>
      </div>

      <div className="flex ml-auto gap-4 font-semibold text-base flex-wrap justify-end">
        {navButtons.map((btn, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <motion.button
              key={idx}
              onClick={() => navigate(btn.path)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer rounded-md px-3 py-1 select-none border-2 border-transparent bg-transparent text-white"
              style={{
                fontWeight: isHovered ? 700 : 500,
                backgroundImage: isHovered
                  ? "linear-gradient(90deg, #7b5cf5, #a855f7, #d8b4fe)"
                  : "none",
                boxShadow: isHovered ? "0 4px 12px #a855f7bb" : "none",
                color: "white",
                outline: "none",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
              }}
              whileTap={{ scale: 0.95 }}
            >
              {btn.name}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

// ---------------- 3D Logo ----------------
function Logo() {
  const texture = new THREE.TextureLoader().load("/logo.png");
  const { viewport } = useThree();
  const aspect = 805 / 148;
  const width = viewport.width * 1.1;
  const height = width / aspect;
  return (
    <mesh position={[0, 0.5, -5.5]} scale={[width, height, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.85}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------- 3D Scene Model ----------------
function SceneModel() {
  const { scene } = useGLTF("/models/scene.glb");
  const ref = useRef();
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0xe5e4e2,
          metalness: 1,
          roughness: 0,
          clearcoat: 1,
          transmission: 0.6,
          ior: 1.45,
          transparent: true,
          opacity: 0.8,
          reflectivity: 1,
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 0.05,
          sheen: 1,
          sheenColor: new THREE.Color(0xff88ff),
        });
      }
    });
  }, [scene]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.003;
  });

  return <primitive ref={ref} object={scene} dispose={null} position={[0, -0.2, 0]} />;
}

// ---------------- Hero Section ----------------
function HeroSection() {
  return (
    <div className="relative w-full h-screen">
      <video
        src="/background.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        className="relative z-10 w-full h-full"
        gl={{ alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Suspense fallback={<Html center>Loading 3D Scene...</Html>}>
          <Environment files="/hdris/studio_small_09.hdr" background={false} />
          <Logo />
          <SceneModel />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 text-white px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold drop-shadow-lg">
          WebRakshak
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mt-2 drop-shadow-md">
          Save your every Click⏫
        </p>
      </div>
    </div>
  );
}

// ---------------- Buffering Shield ----------------
function BufferingShield({ onComplete }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let start;
    const animate = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / 3000, 1);
      setProgress(p);
      if (p < 1) requestAnimationFrame(animate);
      else onComplete();
    };
    requestAnimationFrame(animate);
  }, [onComplete]);
  const shieldPath = "M50 5 L90 20 L80 90 L50 95 L20 90 L10 20 Z";
  const length = 300;
  return (
    <div className="flex justify-center items-center h-screen bg-[#0A0C14]">
      <svg width="120" height="120" viewBox="0 0 100 100">
        <path
          d={shieldPath}
          fill="none"
          stroke="#00ffff"
          strokeWidth="4"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - progress)}
        />
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fill="#00ffff"
          fontSize="14"
          fontWeight="bold"
        >
          {`${Math.round(progress * 100)}%`}
        </text>
      </svg>
    </div>
  );
}

// ---------------- Security Section ----------------
function SecuritySection() {
  const [activeTool, setActiveTool] = useState("url-scan");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const BACKEND_URL = "https://webrakshak.onrender.com/"; // Backend API URL

  const tools = {
    "url-scan": { title: "URL Scanner", placeholder: "Enter URL to scan", apiPath: "/api/scan-url", inputType: "url" },
    "email-scan": { title: "Email Scanner", placeholder: "Paste email content", apiPath: "/api/scan-email", inputType: "textarea" },
    "image-scan": { title: "Image Scanner", placeholder: null, apiPath: "/api/scan-image", inputType: "file" },
    "voice-scan": { title: "Voice Scanner", placeholder: null, apiPath: "/api/scan-voice", inputType: "file" },
  };

  const handleScan = async () => {
    if (!inputValue && tools[activeTool].inputType !== "file") return;
    setIsLoading(true);
    setResult(null);

    try {
      let response;
      if (tools[activeTool].inputType === "file") {
        const fileInput = document.querySelector('input[type="file"]');
        if (!fileInput?.files?.length) throw new Error("No file selected");
        const formData = new FormData();
        formData.append(activeTool === "image-scan" ? "image" : "audio", fileInput.files[0]);
        response = await fetch(`${BACKEND_URL}${tools[activeTool].apiPath}`, { method: "POST", body: formData });
      } else {
        response = await fetch(`${BACKEND_URL}${tools[activeTool].apiPath}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: inputValue }),
        });
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message || "Unknown error" });
    }
    setIsLoading(false);
  };

  return (
    <section className="px-4 py-20 max-w-3xl mx-auto text-center text-white">
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#a855f7]">Security Tools</h2>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {Object.entries(tools).map(([key, tool]) => (
          <button
            key={key}
            onClick={() => { setActiveTool(key); setInputValue(""); setResult(null); }}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              activeTool === key ? "bg-[#a855f7]" : "bg-[#333]"
            }`}
          >
            {tool.title}
          </button>
        ))}
      </div>

      <div className="mb-6">
        {tools[activeTool].inputType === "file" ? (
          <input
            type="file"
            accept={activeTool === "image-scan" ? "image/*" : "audio/*"}
            onChange={(e) => setInputValue(e.target.files ? e.target.files[0] : "")}
            className="w-full p-3 rounded-lg border border-[#a855f7] bg-[#12131a] text-white text-base"
          />
        ) : tools[activeTool].inputType === "textarea" ? (
          <textarea
            placeholder={tools[activeTool].placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows={6}
            className="w-full p-3 rounded-lg border border-[#a855f7] bg-[#12131a] text-white text-base resize-vertical"
          />
        ) : (
          <input
            type={tools[activeTool].inputType}
            placeholder={tools[activeTool].placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 rounded-lg border border-[#a855f7] bg-[#12131a] text-white text-base"
          />
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleScan}
        disabled={isLoading || (!inputValue && tools[activeTool].inputType !== "file")}
        className={`w-full max-w-xs mx-auto block px-6 py-3 rounded-full font-bold ${
          isLoading ? "bg-gray-600 cursor-not-allowed" : "bg-[#a855f7] cursor-pointer"
        }`}
      >
        {isLoading ? "Scanning..." : "Scan"}
      </motion.button>

      {result && (
        <div className="mt-8 p-4 rounded-lg bg-[#12131a] text-left text-sm sm:text-base overflow-x-auto text-[#a855f7]">
          {result.error ? `Error: ${result.error}` : JSON.stringify(result, null, 2)}
        </div>
      )}
    </section>
  );
}

// ---------------- Main App ----------------
export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Navbar />
      {!loaded && <BufferingShield onComplete={() => setLoaded(true)} />}
      {loaded && (
        <>
          <HeroSection />
          <SecuritySection />
          <MetricsOverview />
          <EngagementSection />
          <VotePhishSection />
          <RecentNewsSection />
          <ContactUs />
          <footer className="mt-16 bg-[#0A0C14] p-10 text-gray-400 text-center text-sm max-w-5xl mx-auto border-t border-gray-900 font-sans">
            <p>
              Checkphish provides free online security tools for mitigating typosquatting, domain, and phishing risks. Join the thousands of active security professionals today!
            </p>
          </footer>
        </>
      )}
    </>
  );
}

useGLTF.preload("/models/scene.glb");
