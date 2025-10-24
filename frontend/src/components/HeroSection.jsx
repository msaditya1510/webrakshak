import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Html } from "@react-three/drei";
import * as THREE from "three";

function SceneModel() {
  const { scene } = useGLTF("/models/scene.glb");
  const ref = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          metalness: 1,
          roughness: 0,
          transmission: 0.8,
          thickness: 0.5,
          clearcoat: 1,
          clearcoatRoughness: 0,
          color: new THREE.Color(0xbdd5e6),
          envMapIntensity: 1.5,
          ior: 1.45,
        });
      }
    });
  }, [scene]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.003;
  });

  return <primitive ref={ref} object={scene} scale={[1.1, 1.1, 1.1]} />;
}

export default function HeroSection() {
  return (
    <div className="hero-section">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 45 }} gl={{ alpha: true }}>
        <Suspense fallback={<Html center>Loading...</Html>}>
          <Environment files="/hdris/studio_small_09.hdr" background={false} />
          <SceneModel />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
      <div className="hero-text">
        <h1>WebRakshak</h1>
        <p>Guarding the Digital Frontier</p>
      </div>
    </div>
  );
}
