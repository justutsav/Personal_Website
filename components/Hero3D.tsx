"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import type { Group } from "three";

function Sculpture() {
  const group = useRef<Group>(null);

  // Ease the whole sculpture toward the pointer for a parallax feel
  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    const g = group.current;
    g.rotation.y += (pointer.x * 0.6 - g.rotation.y) * Math.min(delta * 3, 1);
    g.rotation.x += (-pointer.y * 0.45 - g.rotation.x) * Math.min(delta * 3, 1);
  });

  return (
    <group ref={group}>
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.2}>
        {/* distorted rust blob */}
        <mesh scale={1.55}>
          <icosahedronGeometry args={[1, 48]} />
          <MeshDistortMaterial
            color="#ff5a24"
            roughness={0.3}
            metalness={0.2}
            distort={0.42}
            speed={2}
          />
        </mesh>
        {/* bone wireframe orbits */}
        <mesh scale={2.3} rotation={[0.8, 0.4, 0]}>
          <torusGeometry args={[1, 0.012, 12, 120]} />
          <meshBasicMaterial color="#f2ede2" wireframe transparent opacity={0.5} />
        </mesh>
        <mesh scale={2.6} rotation={[-0.6, 0.9, 0.3]}>
          <torusGeometry args={[1, 0.008, 12, 120]} />
          <meshBasicMaterial color="#ff5a24" wireframe /></mesh>
      </Float>
    </group>
  );
}

/**
 * Pointer-reactive 3D sculpture floating in the hero.
 * Rendered client-side only (dynamic import); skipped entirely when the
 * user prefers reduced motion.
 */
export default function Hero3D() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      className="!pointer-events-none"
      eventSource={
        typeof document !== "undefined" ? document.body : undefined
      }
      eventPrefix="client"
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-5, -2, 3]} intensity={0.5} color="#f3ecdd" />
      <Suspense fallback={null}>
        <Sculpture />
      </Suspense>
    </Canvas>
  );
}
