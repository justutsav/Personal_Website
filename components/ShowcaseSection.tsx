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
  AdditiveBlending,
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
  /** forced title line breaks; falls back to width-wrapping `label` */
  labelLines?: string[];
  metric: string;
  tech: string[];
  tint: string;
};

const SHOWCASE: Service[] = [
  {
    tag: "end to end",
    label: "Full-Stack Websites",
    labelLines: ["Full-Stack", "Websites"],
    metric: "A complete website, built and launched for you — from a rough idea to something real people use every day.",
    tech: ["Logins & accounts", "Your own database", "Live on the web"],
    tint: "#1f4a3a",
  },
  {
    tag: "on the phone",
    label: "Mobile Apps",
    metric: "Your product as a real phone app people can download, open, and keep coming back to.",
    tech: ["On the app store", "Works offline", "Push notifications"],
    tint: "#2a2f5e",
  },
  {
    tag: "hands off",
    label: "AI Automation",
    metric: "Hand off the boring, repeating work — it runs itself, so you don't have to lift a finger.",
    tech: ["Tedious tasks, gone", "Runs on its own", "Cloud or private"],
    tint: "#4a2148",
  },
  {
    tag: "one clear view",
    label: "Dashboards & Portals",
    metric: "All your scattered numbers pulled into one screen you — and the people you answer to — can trust.",
    tech: ["One clear view", "Always up to date", "Secure logins"],
    tint: "#1c3a5e",
  },
  {
    tag: "when nothing fits",
    label: "Custom Tools",
    metric: "When no app quite fits, a small tool that does exactly the one thing you need — often within the week.",
    tech: ["Built for one job", "Small & fast", "Made this week"],
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
 * framework chips. */
/* ---------- canvas helpers ---------- */
const TEX_W = 1024;
const TEX_H = 640;

/** hex (#rrggbb) to rgba() string at alpha a */
function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
/** lighten a hex toward white by t (0..1) */
function lighten(hex: string, t: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * t);
  const g = Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * t);
  const b = Math.round((n & 255) + (255 - (n & 255)) * t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
/** darken a hex toward the page background (#0e0d0b) by t (0..1) — keeps the
 * flat card colours in the same warm near-black family as their surroundings */
function darken(hex: string, t: number) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number, b: number) => Math.round(c + (b - c) * t);
  const r = mix((n >> 16) & 255, 0x0e);
  const g = mix((n >> 8) & 255, 0x0d);
  const b = mix(n & 255, 0x0b);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
/** reusable rounded-rect path */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
/** cheap tiling noise pattern (built once per canvas) */
function grainPattern(ctx: CanvasRenderingContext2D) {
  const t = document.createElement("canvas");
  t.width = t.height = 128;
  const tc = t.getContext("2d")!;
  const id = tc.createImageData(128, 128);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = 120 + Math.random() * 135;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
    id.data[i + 3] = 255;
  }
  tc.putImageData(id, 0, 0);
  return ctx.createPattern(t, "repeat")!;
}

/** BACK plane: instead of one flat chunk, alternating vertical stripes in two
 * close tones of the (darkened) service colour — a subtle light/dark pattern
 * that reads as texture + depth. Soft-edged so it looks like ridges. */
function makeCardTexture(entry: Service) {
  const c = document.createElement("canvas");
  c.width = TEX_W;
  c.height = TEX_H;
  const ctx = c.getContext("2d")!;
  const W = TEX_W;
  const H = TEX_H;

  const darkC = darken(entry.tint, 0.5);
  const liteC = darken(entry.tint, 0.32);

  // base = darker tone
  ctx.fillStyle = darkC;
  ctx.fillRect(0, 0, W, H);

  // equal-width vertical bands: ~5 lighter + ~5 dark segments, all the same
  // size, for a clean two-tone grid
  const band = Math.round(W / 10);
  ctx.fillStyle = liteC;
  for (let x = 0; x < W; x += band * 2) {
    ctx.fillRect(x, 0, band, H);
  }

  // very light grain over everything
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = grainPattern(ctx);
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // thin border
  ctx.strokeStyle = "rgba(242,237,226,0.22)";
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  return new CanvasTexture(c);
}

/** HALO plane: soft radial glow that bleeds around the card edges. */
function makeHaloTexture(tint: string) {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, S * 0.18, S / 2, S / 2, S * 0.5);
  g.addColorStop(0, rgba(lighten(tint, 0.3), 0.55));
  g.addColorStop(0.6, rgba(tint, 0.28));
  g.addColorStop(1, rgba(tint, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return new CanvasTexture(c);
}

/** FRONT plane: transparent canvas holding tag, wrapped title and tech chips. */
function makeForegroundTexture(entry: Service) {
  const W = 1024;
  const H = 640;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // transparent canvas — only text/chips, so it can float over the aurora
  const PAD = 72;
  const MID = W / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;

  // tag
  ctx.fillStyle = "#f0b25e";
  ctx.font = "600 30px monospace";
  ctx.fillText(entry.tag.toUpperCase().split("").join(" "), MID, 130);

  // title wrapped to up to 2 lines
  ctx.fillStyle = "#f6f1e7";
  ctx.font = "800 92px system-ui, sans-serif";
  let lines: string[];
  if (entry.labelLines) {
    lines = entry.labelLines;
  } else {
    const words = entry.label.split(" ");
    lines = [];
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
  }
  const titleTop = lines.length > 1 ? 250 : 300;
  lines.forEach((ln, i) => ctx.fillText(ln, MID, titleTop + i * 96));

  // hairline + small label so the plain-language part reads apart from the title
  ctx.strokeStyle = "rgba(246,241,231,0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.3, H - 232);
  ctx.lineTo(W * 0.7, H - 232);
  ctx.stroke();
  ctx.fillStyle = "rgba(240,178,94,0.85)";
  ctx.font = "600 22px monospace";
  ctx.fillText("W H A T   Y O U   G E T", MID, H - 200);

  // plain-language "what you get" chips
  ctx.font = "500 28px monospace";
  const chipH = 52;
  const gap = 16;
  const maxRow = W - PAD * 2;
  const chips = entry.tech.map((t) => ({ t, w: ctx.measureText(t).width + 44 }));
  const rows: { t: string; w: number }[][] = [[]];
  let rowW = 0;
  for (const ch of chips) {
    if (rowW + ch.w > maxRow && rows[rows.length - 1].length) {
      rows.push([]);
      rowW = 0;
    }
    rows[rows.length - 1].push(ch);
    rowW += ch.w + gap;
  }
  let cy = H - 160;
  for (const row of rows) {
    const totalW = row.reduce((s, ch) => s + ch.w, 0) + gap * (row.length - 1);
    let cx = (W - totalW) / 2;
    for (const ch of row) {
      ctx.strokeStyle = "rgba(246,241,231,0.55)";
      ctx.fillStyle = "rgba(20,17,14,0.35)";
      ctx.lineWidth = 2;
      roundRect(ctx, cx, cy, ch.w, chipH, chipH / 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f8f3ea";
      ctx.fillText(ch.t, cx + ch.w / 2, cy + chipH / 2 + 10);
      cx += ch.w + gap;
    }
    cy += chipH + gap;
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
  const group = useRef<Group>(null!);
  const backRef = useRef<Mesh>(null!);
  const frontRef = useRef<Mesh>(null!);
  const haloRef = useRef<Mesh>(null!);

  const geometry = useCurvedGeometry();
  const haloGeo = useMemo(() => new PlaneGeometry(6.4, 4.5, 1, 1), []);
  const entry = SHOWCASE[index];

  const auroraTex = useMemo(() => makeCardTexture(entry), [entry]);
  const fgTex = useMemo(() => makeForegroundTexture(entry), [entry]);
  const haloTex = useMemo(() => makeHaloTexture(entry.tint), [entry]);

  const backMat = useMemo(
    () => new MeshBasicMaterial({ map: auroraTex, transparent: true, toneMapped: false }),
    [auroraTex]
  );
  const frontMat = useMemo(
    () => new MeshBasicMaterial({ map: fgTex, transparent: true, toneMapped: false }),
    [fgTex]
  );
  const haloMat = useMemo(
    () =>
      new MeshBasicMaterial({
        map: haloTex,
        transparent: true,
        toneMapped: false,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [haloTex]
  );

  const dark = useMemo(() => new Color("#22201c"), []);
  const white = useMemo(() => new Color("#ffffff"), []);

  useFrame((state) => {
    // panel i sits at i·SPACING along an open arc; rotation slides it through
    const a = index * SPACING - rotation.get();
    const g = group.current;

    g.position.set(
      Math.sin(a) * RADIUS * 1.28,
      -Math.sin(a) * 0.62,
      (Math.cos(a) - 1) * RADIUS
    );
    g.rotation.y = a * 1.12;

    const focus = Math.max(0, 1 - Math.abs(a) / (SPACING * 0.8));
    // solid card: opaque across the visible band so the orbit behind never
    // bleeds through the flat colour; only the outgoing card fades out
    const edge = Math.abs(a);
    const FADE0 = SPACING * 1.6;
    const FADE1 = SPACING * 2.2;
    const op = edge >= FADE1 ? 0 : edge <= FADE0 ? 1 : (FADE1 - edge) / (FADE1 - FADE0);
    backMat.opacity = op;
    frontMat.opacity = op;
    haloMat.opacity = op * focus * 0.5;
    backMat.color.copy(dark).lerp(white, 0.4 + focus * 0.6);
    frontMat.color.copy(dark).lerp(white, 0.5 + focus * 0.5);
    g.scale.setScalar(0.8 + focus * 0.2);

    // parallax — subtle (~20% of before) and ONLY on the centre card; side
    // cards stay put so the whole area doesn't drift
    const pf = focus > 0.6 ? (focus - 0.6) / 0.4 : 0;
    const px = state.pointer.x * pf;
    const py = state.pointer.y * pf;
    backRef.current.position.set(px * 0.028, py * 0.028, 0);
    frontRef.current.position.set(-px * 0.02, -py * 0.02, 0.07);
    haloRef.current.position.set(px * 0.04, py * 0.04, -0.2);
  });

  return (
    <group ref={group}>
      <mesh ref={haloRef} geometry={haloGeo} material={haloMat} position={[0, 0, -0.2]} />
      <mesh ref={backRef} geometry={geometry} material={backMat} />
      <mesh ref={frontRef} geometry={geometry} material={frontMat} position={[0, 0, 0.07]} scale={[0.985, 0.985, 1]} />
    </group>
  );
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
                {entry.labelLines
                  ? entry.labelLines.map((ln, i) => (
                      <span key={ln} className={i > 0 ? "block" : undefined}>
                        {ln}
                      </span>
                    ))
                  : entry.label}
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
