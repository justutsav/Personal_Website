"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  motion,
  MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  CanvasTexture,
  Color,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
} from "three";

/* ---------- showcase entries (videos/photos land here later) ---------- */

const SHOWCASE = [
  { label: "Atul Finance", metric: "₹75L+ managed", tint: "#233d33" },
  { label: "JustTrade", metric: "every trade, one screen", tint: "#1c3050" },
  { label: "JustFinance", metric: "the business ledger", tint: "#2b3b42" },
  { label: "Grit", metric: "23 Play Store releases", tint: "#35284a" },
  { label: "SplitFree", metric: "Splitwise, retired", tint: "#5c3a1c" },
  { label: "Astro AI", metric: "kundli × AI chat", tint: "#452136" },
  { label: "JustWhisper", metric: "offline voice typing", tint: "#3d3b24" },
  { label: "WPM Overlay", metric: "live typing speed", tint: "#462d22" },
];

const N = SHOWCASE.length;
const RADIUS = 4.6;
const ARC = (Math.PI * 2) / N;
// total rotation: bring all 8 panels through the front spot
const TOTAL_TURN = ARC * (N - 1);

/* ---------- curved panel ---------- */

/** Plane bent toward the viewer — the "eyeball" curve. */
function useCurvedGeometry() {
  return useMemo(() => {
    const geo = new PlaneGeometry(2.1, 1.3, 24, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, -Math.pow(x / 1.05, 2) * 0.28);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
}

/** Placeholder art: tinted card with label + metric, drawn to a canvas. */
function makeLabelTexture(label: string, metric: string, tint: string) {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 400;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, 640, 400);
  // faint frame
  ctx.strokeStyle = "rgba(242,237,226,0.25)";
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, 612, 372);
  ctx.fillStyle = "#f2ede2";
  ctx.font = "700 52px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.toUpperCase(), 320, 190);
  ctx.fillStyle = "rgba(242,237,226,0.65)";
  ctx.font = "26px monospace";
  ctx.fillText(metric, 320, 245);
  ctx.fillStyle = "rgba(242,237,226,0.4)";
  ctx.font = "20px monospace";
  ctx.fillText("video coming soon", 320, 330);
  return new CanvasTexture(c);
}

function Panel({
  index,
  progress,
}: {
  index: number;
  progress: MotionValue<number>;
}) {
  const mesh = useRef<Mesh>(null!);
  const geometry = useCurvedGeometry();
  const entry = SHOWCASE[index];
  const texture = useMemo(
    () => makeLabelTexture(entry.label, entry.metric, entry.tint),
    [entry]
  );
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: texture,
        transparent: true,
        toneMapped: false,
      }),
    [texture]
  );
  const dark = useMemo(() => new Color("#0e0d0b"), []);
  const white = useMemo(() => new Color("#ffffff"), []);

  // ring placement: panel i sits at angle θ_i; the group spins with scroll
  const theta = -index * ARC;

  useFrame(() => {
    const p = progress.get();
    const omega = ARC * 0.9 + p * TOTAL_TURN; // start: panel 0 entering from the right
    const angle = theta + omega;
    // world position on the ring
    mesh.current.position.set(
      Math.sin(angle) * RADIUS,
      0,
      Math.cos(angle) * RADIUS - RADIUS // front of ring ≈ z 0, back recedes
    );
    mesh.current.rotation.y = angle;

    // proximity to the front spot (angle 0): 1 = centered
    const d = Math.abs(((angle + Math.PI) % (Math.PI * 2)) - Math.PI);
    const focus = Math.max(0, 1 - d / (ARC * 1.15));
    // sharp+bright at front, dim+ghosted as it swings away
    material.opacity = 0.25 + focus * 0.75;
    material.color.copy(dark).lerp(white, 0.45 + focus * 0.55);
    const s = 0.82 + focus * 0.3;
    mesh.current.scale.setScalar(s);
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
}

function Ring({ progress }: { progress: MotionValue<number> }) {
  return (
    <group position={[0, -0.1, 0]}>
      {SHOWCASE.map((_, i) => (
        <Panel key={i} index={i} progress={progress} />
      ))}
    </group>
  );
}

/* ---------- statement with word-by-word progress ---------- */

const STATEMENT =
  "Real businesses run on my code. Investor portals moving ₹75L+. Trading dashboards. Play Store apps. Tools I use every day. Built alone. Kept running.";

function StatementWords({ progress }: { progress: MotionValue<number> }) {
  const words = STATEMENT.split(" ");
  return (
    <p className="font-display mx-auto max-w-[22ch] text-center text-[clamp(1.9rem,4.6vw,4.2rem)] font-extrabold uppercase leading-[1.05]">
      {words.map((word, i) => (
        <Word
          key={i}
          word={word}
          progress={progress}
          start={0.05 + (i / words.length) * 0.72}
        />
      ))}
    </p>
  );
}

function Word({
  word,
  progress,
  start,
}: {
  word: string;
  progress: MotionValue<number>;
  start: number;
}) {
  const opacity = useTransform(progress, [start, start + 0.04], [0.13, 1]);
  const highlight = /₹|75L\+|alone\.|running\./i.test(word);
  return (
    <motion.span
      style={{ opacity }}
      className={highlight ? "text-accent" : undefined}
    >
      {word}{" "}
    </motion.span>
  );
}

/* ---------- section ---------- */

/**
 * "Real businesses" showcase: pinned stage where the statement lights up
 * word by word while curved media panels orbit in from the right, hold
 * the front spot, and recede to the back. Panels are placeholders until
 * videos/photos land in public/media/showcase/.
 */
export function ShowcaseSection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const counter = useTransform(scrollYProgress, (p) =>
    String(Math.min(N, Math.max(1, Math.round(p * (N - 1)) + 1))).padStart(2, "0")
  );

  if (reduce) {
    return (
      <section className="px-[var(--edge)] py-[var(--section-gap)] text-center">
        <p className="font-display mx-auto max-w-[22ch] text-[length:var(--text-h1)] font-extrabold uppercase">
          {STATEMENT}
        </p>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[450vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* orbiting panels */}
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 7.5], fov: 40 }}
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true }}
            className="!pointer-events-none"
          >
            <Ring progress={scrollYProgress} />
          </Canvas>
        </div>

        {/* statement overlay */}
        <div className="relative px-[var(--edge)]">
          <StatementWords progress={scrollYProgress} />
        </div>

        {/* progress counter */}
        <div className="absolute bottom-8 right-[var(--edge)] flex items-baseline gap-1 font-mono text-small text-ink-soft">
          <motion.span className="text-accent-2">{counter}</motion.span>
          <span>/ {String(N).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
}
