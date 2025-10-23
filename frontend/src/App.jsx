import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Html, OrbitControls, Environment } from "@react-three/drei"; 
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./style.css";

gsap.registerPlugin(ScrollTrigger);

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
          clearcoatRoughness: 0,
          reflectivity: 1,
          transmission: 0.6,
          ior: 1.45,
          opacity: 0.8,
          transparent: true,
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 0.05,
          sheen: 1,
          sheenColor: new THREE.Color(0xff88ff),
        });

        gsap.to(child.material.color, {
          r: 0.85 + Math.random() * 0.15,
          g: 0.85 + Math.random() * 0.15,
          b: 0.85 + Math.random() * 0.15,
          duration: 3 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    });
  }, [scene]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.003;
  });

  return <primitive ref={ref} object={scene} dispose={null} position={[0, -0.2, 0]} scale={[1.0, 1.0, 1.0]} />;
}

// ---------------- Navbar ----------------
function Navbar() {
  return (
    <nav
      className="fixed top-4 right-4 z-50 px-6 py-2 rounded-full shadow-lg"
      style={{
        background: "rgba(255,255,255,0.0)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        backdropFilter: "blur(8px)",
      }}
    >
      <span role="img" aria-label="lock" style={{ fontSize: 18, color: "#ffffff" }}>🔒</span>
      <span
        style={{
          fontWeight: "bold",
          fontSize: "1.2rem",
          background: "linear-gradient(90deg, #7b5cf5, #ffffff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        WebRakshak
      </span>
    </nav>
  );
}

// ---------------- Hero Section ----------------
function HeroSection() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      <video
        src="/background.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        style={{ position: "relative", zIndex: 1, height: "100%" }}
        gl={{ alpha: true }}
      >
        <Suspense fallback={<Html center>Loading 3D Scene...</Html>}>
          <Environment files="/hdris/studio_small_09.hdr" background={false} />
          <Logo />
          <SceneModel />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
      <div style={{ position: "absolute", top: "40%", width: "100%", textAlign: "center", zIndex: 2, color: "white" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: "bold", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>WebRakshak</h1>
        <p style={{ fontSize: "1.5rem", marginTop: 8, textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
          Guarding the Digital Frontier
        </p>
      </div>
    </div>
  );
}

// ---------------- Security Tools Section ----------------
function SecuritySection() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [speechFile, setSpeechFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [genericFile, setGenericFile] = useState(null);
  const [results, setResults] = useState(null);
  const [score, setScore] = useState(0);

  const handleScan = async (type) => {
    const fakeScore = Math.floor(Math.random() * 100);
    setScore(fakeScore);
    setResults({
      type,
      details: [
        { reason: "Suspicious domain age < 7 days", confidence: 0.9 },
        { reason: "Contains credential harvesting form", confidence: 0.8 },
      ],
    });
  };

  return (
    <div
      className="security-section"
      style={{
        minHeight: "100vh",
        background: "#0A0C14",
        padding: "60px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "40px",
        color: "white",
      }}
    >
      <h2 style={{ fontSize: "3rem", fontWeight: "bold" }}>Security Tools</h2>
      <p style={{ maxWidth: 700, textAlign: "center", fontSize: 18 }}>
        Scan URLs, emails, audio, images, and files to detect phishing and malicious content instantly.
      </p>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {["URL","Email","Audio","Image","File"].map((type) => (
          <ScanCard
            key={type}
            type={type}
            value={type==="URL"?url:type==="Email"?email:""}
            onChange={type==="URL"?setUrl:type==="Email"?setEmail:()=>{}}
            file={type==="Audio"?speechFile:type==="Image"?imageFile:type==="File"?genericFile:null}
            setFile={type==="Audio"?setSpeechFile:type==="Image"?setImageFile:setGenericFile}
            handleScan={() => handleScan(type)}
          />
        ))}
      </div>

      {score > 0 && (
        <div style={{ marginTop: 40, textAlign: "center", width: "100%", maxWidth: 1000 }}>
          <h3 style={{ fontSize: 24, marginBottom: 20 }}>Security Score: {score}/100</h3>
          <SecurityScore score={score} />
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}>
            {results?.details.map((d, i) => (
              <div key={i} style={{ background: "#111", padding: 16, borderRadius: 12, width: 260, boxShadow: "0 6px 16px rgba(0,255,255,0.2)" }}>
                <p><b>Reason:</b> {d.reason}</p>
                <p><b>Confidence:</b> {Math.round(d.confidence * 100)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Individual Scan Card ----------------
function ScanCard({ type, value, onChange, file, setFile, handleScan }) {
  const inputProps = type==="URL"||type==="Email" ? {
    placeholder: type==="URL"?"Enter URL":"Enter Email",
    value,
    onChange: (e) => onChange(e.target.value),
    type: "text"
  } : {
    type: "file",
    accept: type==="Audio"?"audio/*":type==="Image"?"image/*":"*/*",
    onChange: (e) => setFile(e.target.files[0])
  };

  const colors = { URL: "#00ffff", Email: "#ff00ff", Audio: "#00ff00", Image: "#FFA500", File: "#1E90FF" };

  return (
    <div style={{ background: "#1a1a1a", borderRadius: 16, padding: 24, width: 320, boxShadow: `0 8px 20px ${colors[type]}33` }}>
      <h3 style={{ fontSize: 20, marginBottom: 12, background: `linear-gradient(90deg,${colors[type]},#ffffff)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{type} Scan</h3>
      <input {...inputProps} style={{ padding: 10, width: "100%", marginBottom: 12, borderRadius: 8, border: "1px solid #333", background: "#0a0c14", color: "white" }} />
      <button onClick={handleScan} style={{ width: "100%", padding: 10, borderRadius: 8, background: `linear-gradient(90deg,${colors[type]},#ffffff)`, color: "#0A0C14", fontWeight: "bold" }}>
        Scan {type}
      </button>
    </div>
  );
}

// ---------------- Security Score ----------------
function SecurityScore({ score }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      <svg width="120" height="120">
        <circle cx="60" cy="60" r={radius} stroke="#555" strokeWidth="10" fill="none" />
        <circle cx="60" cy="60" r={radius} stroke="#00ffff" strokeWidth="10" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        <text x="60" y="65" textAnchor="middle" fontSize="20" fill="#fff">{score}%</text>
      </svg>
      <p style={{ color: "#ccc", marginTop: 8 }}>Improve your security: Enable 2FA (+10 pts)</p>
    </div>
  );
}

// ---------------- Preloader ----------------
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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0A0C14" }}>
      <svg width="120" height="120" viewBox="0 0 100 100">
        <path d={shieldPath} fill="none" stroke="#00ffff" strokeWidth="4" strokeDasharray={length} strokeDashoffset={length * (1 - progress)} />
        <text x="50" y="55" textAnchor="middle" fill="#00ffff" fontSize="14" fontWeight="bold">{`${Math.round(progress * 100)}%`}</text>
      </svg>
    </div>
  );
}

// ---------------- User Engagement Section ----------------
function EngagementSection() {
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [badge, setBadge] = useState(null);
  const [userPoints, setUserPoints] = useState(0);

  const handleChallenge = () => {
    setChallengeComplete(true);
    setUserPoints((prev) => prev + 10);
    setBadge("🛡️ Phish Hunter Badge");
  };

  return (
    <div style={{ minHeight: "80vh", background: "#12131a", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "40px", color: "white" }}>
      <h2 style={{ fontSize: "3rem", fontWeight: "bold" }}>Engage & Learn</h2>
      <p style={{ maxWidth: 700, textAlign: "center", fontSize: 18 }}>
        Sharpen your cybersecurity skills, earn badges, and complete challenges!
      </p>

      <div style={{ background: "#1a1a1a", borderRadius: 16, padding: 24, maxWidth: 600, width: "100%", boxShadow: "0 8px 20px rgba(0,255,255,0.2)", textAlign: "center" }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>Mini Phishing Challenge</h3>
        <p>Identify whether this email is phishing or safe:</p>
        <div style={{ background: "#111", padding: 12, margin: "12px 0", borderRadius: 8, color: "#0ff" }}>
          <b>From:</b> support@paypal-security.com <br />
          <b>Subject:</b> Urgent: Verify your account now! <br />
          <b>Body:</b> Your account has been limited. Click the link below to restore access.
        </div>
        {!challengeComplete ? (
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={handleChallenge} style={{ padding: "10px 20px", borderRadius: 8, background: "linear-gradient(90deg,#00ffff,#7b5cf5)", color: "#0A0C14", fontWeight: "bold" }}>Phishing</button>
            <button onClick={handleChallenge} style={{ padding: "10px 20px", borderRadius: 8, background: "linear-gradient(90deg,#ff00ff,#ff7b00)", color: "#0A0C14", fontWeight: "bold" }}>Safe</button>
          </div>
        ) : (
          <p style={{ color: "#0ff", marginTop: 12 }}>✅ Challenge Completed! You earned 10 points!</p>
        )}
      </div>

      {badge && (
        <div style={{ background: "#1a1a1a", borderRadius: 16, padding: 24, maxWidth: 400, textAlign: "center", boxShadow: "0 8px 20px rgba(255,255,0,0.2)" }}>
          <h3>Achievements</h3>
          <p>{badge}</p>
          <p>Total Points: {userPoints}</p>
        </div>
      )}
    </div>
  );
}

// ---------------- Vote on Phish Section ----------------
function VotePhishSection() {
  const [reports, setReports] = useState([
    { id: 1, type: "URL", content: "http://paypal-secure-login.com", votes: { phish: 5, safe: 2 } },
    { id: 2, type: "Email", content: "support@banksecure.com", votes: { phish: 3, safe: 4 } },
  ]);

  const handleVote = (id, voteType) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, votes: { ...r.votes, [voteType]: r.votes[voteType] + 1 } } : r
      )
    );
  };

  return (
    <div style={{ minHeight: "80vh", background: "#0A0C14", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "40px", color: "white" }}>
      <h2 style={{ fontSize: "3rem", fontWeight: "bold" }}>Vote on Suspicious Items</h2>
      <p style={{ maxWidth: 700, textAlign: "center", fontSize: 18 }}>
        Help the community identify phishing content by voting whether an item is safe or malicious.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 800 }}>
        {reports.map((r) => (
          <div key={r.id} style={{ background: "#1a1a1a", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 8px 20px rgba(0,255,255,0.2)" }}>
            <div>
              <p><b>{r.type}:</b> {r.content}</p>
              <p>Votes: Phish ({r.votes.phish}) | Safe ({r.votes.safe})</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleVote(r.id, "phish")} style={{ padding: "6px 12px", borderRadius: 8, background: "linear-gradient(90deg,#ff00ff,#ff7b00)", color: "#0A0C14", fontWeight: "bold" }}>Phish</button>
              <button onClick={() => handleVote(r.id, "safe")} style={{ padding: "6px 12px", borderRadius: 8, background: "linear-gradient(90deg,#00ffff,#7b5cf5)", color: "#0A0C14", fontWeight: "bold" }}>Safe</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Recent Phishing News Section ----------------
function RecentNewsSection() {
  const [news, setNews] = useState([
    { title: "Phishing Attack Targets Bank Customers", link: "#" },
    { title: "New Credential Harvesting Scam on WhatsApp", link: "#" },
    { title: "Fake PayPal Login Pages Spread Rapidly", link: "#" },
  ]);

  return (
    <div style={{ minHeight: "60vh", background: "#12131a", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "40px", color: "white" }}>
      <h2 style={{ fontSize: "3rem", fontWeight: "bold" }}>Recent Phishing News</h2>
      <p style={{ maxWidth: 700, textAlign: "center", fontSize: 18 }}>
        Stay updated on the latest phishing threats and campaigns around the world.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, width: "100%" }}>
        {news.map((n, i) => (
          <a key={i} href={n.link} target="_blank" style={{ background: "#1a1a1a", padding: 16, borderRadius: 12, textDecoration: "none", color: "#00ffff", boxShadow: "0 6px 16px rgba(0,255,255,0.2)" }}>
            {n.title}
          </a>
        ))}
      </div>
    </div>
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
          <EngagementSection />
          <VotePhishSection />
          <RecentNewsSection />
        </>
      )}
    </>
  );
}

useGLTF.preload("/models/scene.glb");
