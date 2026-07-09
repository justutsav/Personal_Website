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
import { MOBILE_QUERY, useMediaQuery } from "@/components/useMediaQuery";

/* ---------- services (what I can build for you) ----------
 * Each slide = one service. `tech` renders as chips on the 3D panel; `metric`
 * is the one-line caption at the bottom. All grounded in real shipped work. */

type Service = {
  tag: string;
  label: string;
  metric: string;
  tech: string[];
  tint: string;
};

const SHOWCASE: Service[] = [
  {
    tag: "end to end",
    label: "Full-stack web apps",
    metric: "You bring the idea — I return a deployed product. Auth, database, frontend, deployment, all of it.",
    tech: ["React", "TypeScript", "Supabase", "PostgreSQL", "Next.js"],
    tint: "#1f4a3a",
  },
  {
    tag: "data & money",
    label: "Dashboards & portals",
    metric: "Investor portals and dashboards that pull scattered data into one screen people actually trust.",
    tech: ["React", "Supabase", "Realtime", "Recharts", "Auth + roles"],
    tint: "#1c3a5e",
  },
  {
    tag: "web to store",
    label: "Mobile apps",
    metric: "Web app to a real Play Store listing — 23 releases shipped, subscriptions and push included.",
    tech: ["Capacitor", "Android", "RevenueCat", "OneSignal"],
    tint: "#3a2a5a",
  },
  {
    tag: "built in",
    label: "AI integration",
    metric: "Chat and assistants backed by LLMs — cloud or fully offline, with vector-aware responses.",
    tech: ["Vercel AI SDK", "OpenRouter", "Ollama", "pgvector"],
    tint: "#4a2148",
  },
  {
    tag: "the craft",
    label: "Motion & frontend",
    metric: "Awwwards-grade, scroll-driven interfaces where every scroll feels directed. Plus the server under it.",
    tech: ["GSAP", "React Three Fiber", "Framer Motion", "Tailwind", "VPS"],
    tint: "#5c3a1c",
  },
];

const N = SHOWCASE.length;
const RADIUS = 5.5;
/** angular gap between cards — wider than a closed ring so neighbours
 * sit half off-screen */
const SPACING = 0.95;
/** progress point where the last (6th) card seats in the front spot */
const LAST_AT = 0.63;
/** the 6th card then HOLDS from LAST_AT→HOLD_AT before any exit begins.
 * The stats wall (-mt-[140vh] on a 500vh section) becomes visible at
 * p = (500-140-100)/400 = 0.65, so the exit starts exactly then — any
 * longer hold reads as a frozen page (scroll input with zero motion). */
const HOLD_AT = 0.65;

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

/** Composite a service card onto a canvas — tag, wrapped title, and a row of
 * framework chips. No external logo assets needed. */
function makeServiceTexture(entry: Service) {
  const W = 1024;
  const H = 640;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // background: tint → near-black, diagonal
  const grad = ctx.createLinearGradient(0, H, W, 0);
  grad.addColorStop(0, entry.tint);
  grad.addColorStop(1, "#14120f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(242,237,226,0.22)";
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  const PAD = 72;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // tag — mono, uppercase, warm accent
  ctx.fillStyle = "#e8a24a";
  ctx.font = "600 30px monospace";
  ctx.fillText(entry.tag.toUpperCase().split("").join(" "), PAD, 110);

  // title — bold, wrapped to the card width, up to 2 lines
  ctx.fillStyle = "#f6f1e7";
  ctx.font = "800 92px system-ui, sans-serif";
  const words = entry.label.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > W - PAD * 2 && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  lines.push(line);
  lines.forEach((ln, i) => ctx.fillText(ln, PAD, 240 + i * 96));

  // tech chips — outlined pills wrapping across the bottom
  ctx.font = "500 28px monospace";
  const chipH = 52;
  const gap = 16;
  let cx = PAD;
  let cy = H - 150;
  for (const t of entry.tech) {
    const tw = ctx.measureText(t).width;
    const chipW = tw + 44;
    if (cx + chipW > W - PAD) {
      cx = PAD;
      cy += chipH + gap;
    }
    ctx.strokeStyle = "rgba(246,241,231,0.45)";
    ctx.lineWidth = 2;
    // rounded rect
    const r = chipH / 2;
    ctx.beginPath();
    ctx.moveTo(cx + r, cy);
    ctx.arcTo(cx + chipW, cy, cx + chipW, cy + chipH, r);
    ctx.arcTo(cx + chipW, cy + chipH, cx, cy + chipH, r);
    ctx.arcTo(cx, cy + chipH, cx, cy, r);
    ctx.arcTo(cx, cy, cx + chipW, cy, r);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "#f6f1e7";
    ctx.fillText(t, cx + 22, cy + chipH / 2 + 10);
    cx += chipW + gap;
  }

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
  const texture = useMemo(() => makeServiceTexture(entry), [entry]);
  const material = useMemo(
    () =>
      new MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }),
    [texture]
  );
  const dark = useMemo(() => new Color("#22201c"), []);
  const white = useMemo(() => new Color("#ffffff"), []);

  useFrame(() => {
    // panel i sits at i·SPACING along an open arc; rotation slides it through
    const a = index * SPACING - rotation.get();

    mesh.current.position.set(
      Math.sin(a) * RADIUS * 1.28, // stretched: neighbours only ~half visible
      -Math.sin(a) * 0.62, // diagonal: enters low from the right, exits high left
      (Math.cos(a) - 1) * RADIUS
    );
    mesh.current.rotation.y = a * 1.12; // a touch more curl on the sides

    const focus = Math.max(0, 1 - Math.abs(a) / (SPACING * 0.8));
    material.opacity = Math.abs(a) > SPACING * 2.2 ? 0 : 0.3 + focus * 0.7;
    material.color.copy(dark).lerp(white, 0.35 + focus * 0.65);
    mesh.current.scale.setScalar(0.8 + focus * 0.2);
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
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // snap with breathing room: cards drift a little with the scroll so the
  // stage never feels frozen, resist, then jump decisively. After the last
  // card, rotation keeps going so it exits while the cream wall lifts.
  const snapped = useTransform(scrollYProgress, (p) => {
    const raw = (p / LAST_AT) * (N - 1);
    const f = Math.min(raw, N - 1);
    const r = Math.round(f);
    const drift = (f - r) * 0.32; // partial follow = "still alive" feel
    // 6th card holds through [LAST_AT, HOLD_AT]; exit only after the hold,
    // in lockstep with the cream wall lifting in.
    const exitP = Math.max(0, (p - HOLD_AT) / (1 - HOLD_AT));
    const exit = exitP * 0.9;
    return (r + drift + exit) * SPACING;
  });
  const rotation = useSpring(snapped, { stiffness: 90, damping: 18, mass: 0.9 });

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) =>
    setActive(
      Math.min(N - 1, Math.max(0, Math.round((p / LAST_AT) * (N - 1))))
    )
  );

  const entry = SHOWCASE[active];

  if (reduce) {
    return (
      <section className="px-[var(--edge)] py-[var(--section-gap)]">
        <h2 className="font-display max-w-[16ch] text-[length:var(--text-h1)] font-extrabold uppercase">
          What I can build for you.
        </h2>
        <ul className="mt-10 space-y-5">
          {SHOWCASE.map((s) => (
            <li key={s.label}>
              <span className="font-display text-xl font-bold text-ink">{s.label}</span>{" "}
              <span className="text-ink-soft">— {s.metric}</span>
              <span className="mt-1 block font-mono text-micro uppercase tracking-wide text-accent-2">
                {s.tech.join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // mobile: the WebGL arc can't shrink to a phone — swap to a horizontal
  // snap-swipe cover carousel with the same entries and captions
  if (isMobile) {
    return (
      <section className="bg-paper py-[var(--section-gap)]">
        <p className="px-[var(--edge)] font-mono text-micro uppercase tracking-[0.3em] text-ink-soft">
          What I can build <span className="text-accent">for you</span>
        </p>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--edge)] pb-4">
          {SHOWCASE.map((s, i) => (
            <figure key={s.label} className="w-[82vw] shrink-0 snap-center">
              <div
                className="relative flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-xl border border-line p-5"
                style={{ background: `linear-gradient(120deg, ${s.tint} 0%, #14120f 100%)` }}
              >
                <span className="font-mono text-micro uppercase tracking-[0.25em] text-[#e8a24a]">
                  {s.tag}
                </span>
                <h3 className="font-display mt-2 text-2xl font-extrabold uppercase leading-none text-[#f6f1e7]">
                  {s.label}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[#f6f1e7]/40 px-2.5 py-1 font-mono text-micro text-[#f6f1e7]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 font-mono text-micro text-white/80">
                  {String(i + 1).padStart(2, "0")}/{String(N).padStart(2, "0")}
                </span>
              </div>
              <figcaption className="mt-3">
                <p className="text-small text-ink-soft">{s.metric}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-2 px-[var(--edge)] font-mono text-micro uppercase tracking-widest text-ink-soft opacity-70">
          swipe →
        </p>
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
          What I can build <span className="text-accent">for you</span>
        </p>

        {/* active card text — bottom left */}
        <div className="absolute bottom-10 left-[var(--edge)] max-w-[46ch]">
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
        </div>

        {/* progress counter — bottom right */}
        <div className="absolute bottom-10 right-[var(--edge)] flex items-baseline gap-1 font-mono text-small text-ink-soft">
          <span className="text-accent-2">{String(active + 1).padStart(2, "0")}</span>
          <span>/ {String(N).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
}
