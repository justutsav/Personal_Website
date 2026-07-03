"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  CanvasTexture,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
} from "three";

/* ---------- showcase entries (videos/photos land here later) ---------- */

const SHOWCASE = [
  { label: "Atul Finance", metric: "₹75L+ under management · 50+ investors", tag: "client work", tint: "#233d33" },
  { label: "JustTrade", metric: "every account, one dashboard", tag: "client work", tint: "#1c3050" },
  { label: "JustFinance", metric: "the ledger behind the business", tag: "client work", tint: "#2b3b42" },
  { label: "Grit", metric: "23 releases on the Play Store", tag: "product", tint: "#35284a" },
  { label: "SplitFree", metric: "Splitwise, retired by my friend group", tag: "product", tint: "#5c3a1c" },
  { label: "Astro AI", metric: "kundli viewing × AI conversations", tag: "client work", tint: "#452136" },
  { label: "JustWhisper", metric: "offline voice typing, any window", tag: "tool", tint: "#3d3b24" },
  { label: "WPM Overlay", metric: "live typing speed, always on top", tag: "tool", tint: "#462d22" },
];

const N = SHOWCASE.length;
const RADIUS = 5.5;
const ARC = (Math.PI * 2) / N;

/* ---------- curved panel ---------- */

/** Wide plane bent toward the viewer — the "eyeball" curve. */
function useCurvedGeometry() {
  return useMemo(() => {
    const geo = new PlaneGeometry(4.4, 2.75, 32, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, -Math.pow(x / 2.2, 2) * 0.5);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
}

/** Placeholder art until real media lands in public/media/showcase/. */
function makeLabelTexture(label: string, tint: string) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 640, 1024, 0);
  grad.addColorStop(0, tint);
  grad.addColorStop(1, "#14120f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 640);
  ctx.strokeStyle = "rgba(242,237,226,0.25)";
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 984, 600);
  ctx.fillStyle = "#f2ede2";
  ctx.font = "700 88px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.toUpperCase(), 512, 330);
  ctx.fillStyle = "rgba(242,237,226,0.45)";
  ctx.font = "30px monospace";
  ctx.fillText("media coming soon", 512, 520);
  return new CanvasTexture(c);
}

function Panel({
  index,
  rotation,
}: {
  index: number;
  rotation: MotionValue<number>;
}) {
  const mesh = useRef<Mesh>(null!);
  const geometry = useCurvedGeometry();
  const entry = SHOWCASE[index];
  const texture = useMemo(() => makeLabelTexture(entry.label, entry.tint), [entry]);
  const material = useMemo(
    () =>
      new MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }),
    [texture]
  );
  const dark = useMemo(() => new Color("#22201c"), []);
  const white = useMemo(() => new Color("#ffffff"), []);

  useFrame(() => {
    // panel i sits at i·ARC; rotation (sprung, snapped) spins the ring
    const angle = index * ARC - rotation.get();
    // wrap to [-π, π]
    const a = ((angle + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;

    mesh.current.position.set(
      Math.sin(a) * RADIUS,
      Math.sin(a) * 0.55, // diagonal: right side rides high, left sinks low
      Math.cos(a) * RADIUS - RADIUS
    );
    mesh.current.rotation.y = a;

    const focus = Math.max(0, 1 - Math.abs(a) / (ARC * 0.85));
    material.opacity = Math.abs(a) > ARC * 2.2 ? 0 : 0.3 + focus * 0.7;
    material.color.copy(dark).lerp(white, 0.35 + focus * 0.65);
    mesh.current.scale.setScalar(0.78 + focus * 0.22);
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
}

function Ring({ rotation }: { rotation: MotionValue<number> }) {
  const group = useRef<Group>(null);

  // tiny pointer wobble on the whole ring
  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    const g = group.current;
    const ease = Math.min(delta * 2.5, 1);
    g.rotation.y += (pointer.x * 0.045 - g.rotation.y) * ease;
    g.rotation.x += (-pointer.y * 0.03 - g.rotation.x) * ease;
  });

  return (
    <group ref={group} position={[0, 0.1, 0]}>
      {SHOWCASE.map((_, i) => (
        <Panel key={i} index={i} rotation={rotation} />
      ))}
    </group>
  );
}

/* ---------- section ---------- */

/**
 * Media-first showcase: big curved panels flow right → left along a
 * gentle diagonal, snapping one card to the front per scroll step
 * (spring resistance, not linear). The active card's title swaps in at
 * the bottom-left, alche.studio style.
 */
export function ShowcaseSection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // snap: stepped target + spring = resistance, then a decisive jump
  const snapped = useTransform(scrollYProgress, (p) =>
    Math.min(N - 1, Math.max(0, Math.round(p * (N - 1)))) * ARC
  );
  const rotation = useSpring(snapped, { stiffness: 90, damping: 18, mass: 0.9 });

  const [active, setActive] = useState(0);
  useMotionValueEvent(snapped, "change", (v) => setActive(Math.round(v / ARC)));

  const entry = SHOWCASE[active];

  if (reduce) {
    return (
      <section className="px-[var(--edge)] py-[var(--section-gap)]">
        <h2 className="font-display max-w-[16ch] text-[length:var(--text-h1)] font-extrabold uppercase">
          Real businesses run on my code.
        </h2>
        <ul className="mt-10 space-y-3">
          {SHOWCASE.map((s) => (
            <li key={s.label} className="text-ink-soft">
              <span className="text-ink">{s.label}</span> — {s.metric}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative z-0 h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* orbiting panels — the main event */}
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 6.2], fov: 40 }}
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true }}
            className="!pointer-events-none"
            eventSource={typeof document !== "undefined" ? document.body : undefined}
            eventPrefix="client"
          >
            <Ring rotation={rotation} />
          </Canvas>
        </div>

        {/* kicker */}
        <p className="absolute top-16 w-full text-center font-mono text-micro uppercase tracking-[0.3em] text-ink-soft">
          Real businesses run on <span className="text-accent">my code</span>
        </p>

        {/* active card text — bottom left */}
        <div className="absolute bottom-10 left-[var(--edge)] right-[var(--edge)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="font-mono text-micro uppercase tracking-[0.25em] text-accent-2">
                {entry.tag}
              </span>
              <h2 className="font-display mt-2 text-[clamp(1.8rem,4vw,3.4rem)] font-extrabold uppercase leading-none">
                {entry.label}
              </h2>
              <p className="mt-2 max-w-[50ch] text-small text-ink-soft">
                {entry.metric}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* progress counter — bottom right */}
          <div className="absolute bottom-0 right-0 flex items-baseline gap-1 font-mono text-small text-ink-soft">
            <span className="text-accent-2">{String(active + 1).padStart(2, "0")}</span>
            <span>/ {String(N).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
