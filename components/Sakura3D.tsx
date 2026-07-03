"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import {
  Color,
  Group,
  InstancedMesh,
  Object3D,
  Quaternion,
  Vector3,
} from "three";

/* ---------- procedural tree ---------- */

type Branch = { pos: Vector3; quat: Quaternion; len: number; radius: number };

function buildTree() {
  const branches: Branch[] = [];
  const tips: Vector3[] = [];
  const up = new Vector3(0, 1, 0);

  const grow = (
    origin: Vector3,
    dir: Vector3,
    len: number,
    radius: number,
    depth: number
  ) => {
    const end = origin.clone().addScaledVector(dir, len);
    const mid = origin.clone().addScaledVector(dir, len / 2);
    branches.push({
      pos: mid,
      quat: new Quaternion().setFromUnitVectors(up, dir.clone().normalize()),
      len,
      radius,
    });
    if (depth === 0) {
      tips.push(end);
      return;
    }
    const kids = depth > 3 ? 2 : Math.random() > 0.4 ? 3 : 2;
    for (let i = 0; i < kids; i++) {
      const spread = 0.55 + Math.random() * 0.35;
      const axis = new Vector3(
        Math.random() - 0.5,
        Math.random() * 0.3,
        Math.random() - 0.5
      ).normalize();
      const newDir = dir
        .clone()
        .applyAxisAngle(axis, spread * (i % 2 === 0 ? 1 : -1))
        .lerp(up, 0.12) // sakura habit: branches sweep gently upward
        .normalize();
      grow(end, newDir, len * (0.68 + Math.random() * 0.1), radius * 0.58, depth - 1);
    }
  };

  grow(new Vector3(0, -2.6, 0), up.clone(), 1.5, 0.16, 6);
  return { branches, tips };
}

/* ---------- blossoms at branch tips ---------- */

function Blossoms({ tips }: { tips: Vector3[] }) {
  const ref = useRef<InstancedMesh>(null!);
  const count = tips.length * 5;

  const { dummies, colors } = useMemo(() => {
    const o = new Object3D();
    const dummies: Object3D[] = [];
    const colors: Color[] = [];
    const palette = [new Color("#ffa7c9"), new Color("#ff8fb8"), new Color("#ffc4da")];
    tips.forEach((tip) => {
      for (let i = 0; i < 5; i++) {
        const d = new Object3D();
        d.position
          .copy(tip)
          .add(
            new Vector3(
              (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.3) * 0.4,
              (Math.random() - 0.5) * 0.5
            )
          );
        const s = 0.1 + Math.random() * 0.12;
        d.scale.setScalar(s);
        dummies.push(d);
        colors.push(palette[Math.floor(Math.random() * palette.length)]);
      }
    });
    void o;
    return { dummies, colors };
  }, [tips]);

  useMemo(() => {
    // set static matrices once after mount via callback ref pattern below
  }, []);

  return (
    <instancedMesh
      ref={(m) => {
        if (!m) return;
        ref.current = m;
        dummies.forEach((d, i) => {
          d.updateMatrix();
          m.setMatrixAt(i, d.matrix);
          m.setColorAt(i, colors[i]);
        });
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      }}
      args={[undefined, undefined, count]}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial roughness={0.6} />
    </instancedMesh>
  );
}

/* ---------- falling petals ---------- */

const PETALS = 260;

function Petals() {
  const ref = useRef<InstancedMesh>(null!);
  const seeds = useMemo(
    () =>
      Array.from({ length: PETALS }, () => ({
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * 9 - 3.5,
        z: (Math.random() - 0.5) * 5,
        speed: 0.25 + Math.random() * 0.5,
        swayAmp: 0.4 + Math.random() * 0.8,
        swayFreq: 0.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 2.5,
        scale: 0.5 + Math.random() * 0.7,
      })),
    []
  );
  const dummy = useMemo(() => new Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    seeds.forEach((s, i) => {
      const y = ((s.y - t * s.speed) % 9 + 9) % 9 - 4.5; // wrap fall
      dummy.position.set(
        s.x + Math.sin(t * s.swayFreq + s.phase) * s.swayAmp,
        y,
        s.z + Math.cos(t * s.swayFreq * 0.7 + s.phase) * 0.3
      );
      dummy.rotation.set(
        s.spin + t * s.spinSpeed,
        s.phase + t * s.spinSpeed * 0.6,
        s.spin * 0.5 + t * s.spinSpeed * 0.4
      );
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, PETALS]}>
      {/* stretched disc ≈ petal */}
      <circleGeometry args={[0.055, 8]} />
      <meshBasicMaterial color="#ffb3d1" transparent opacity={0.85} side={2} />
    </instancedMesh>
  );
}

/* ---------- scene ---------- */

function Tree() {
  const group = useRef<Group>(null);
  const { branches, tips } = useMemo(buildTree, []);

  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    const g = group.current;
    g.rotation.y += (pointer.x * 0.25 - g.rotation.y) * Math.min(delta * 2, 1);
    g.rotation.x += (-pointer.y * 0.06 - g.rotation.x) * Math.min(delta * 2, 1);
  });

  return (
    <group ref={group}>
      {branches.map((b, i) => (
        <mesh key={i} position={b.pos} quaternion={b.quat}>
          <cylinderGeometry args={[b.radius * 0.7, b.radius, b.len, 6]} />
          <meshStandardMaterial color="#2e2320" roughness={0.9} />
        </mesh>
      ))}
      <Blossoms tips={tips} />
      <Petals />
    </group>
  );
}

/**
 * Blurred sakura tree with drifting petals — hero backdrop.
 * Client-only; skipped for reduced motion.
 */
export default function Sakura3D() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <Canvas
      camera={{ position: [0, 0.4, 7], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      className="!pointer-events-none"
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 5]} intensity={1.3} color="#fff1f6" />
      <directionalLight position={[-5, -1, 3]} intensity={0.4} color="#5b8cff" />
      <Tree />
    </Canvas>
  );
}
