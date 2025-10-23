import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';

export function LockScene({ hover }) {
  const gltf = useGLTF('/models/lock.glb');
  const ref = useRef();

  useEffect(() => {
    gltf.scene.traverse(c => {
      if(c.isMesh){
        c.material = c.material.clone();
        c.material.transparent=true;
        c.material.opacity=0.9;
        c.material.emissive = new THREE.Color(0x2e7eff);
        c.material.emissiveIntensity = 0.6;
      }
    });
  }, [gltf]);

  useFrame(state => {
    if(!ref.current) return;
    ref.current.rotation.y += 0.002;
    if(hover){
      const s = 1 + 0.03*Math.sin(state.clock.elapsedTime*3);
      ref.current.scale.set(s,s,s);
    }
  });

  return <primitive ref={ref} object={gltf.scene} scale={[1.2,1.2,1.2]} position={[0,-0.4,0]} />;
}
