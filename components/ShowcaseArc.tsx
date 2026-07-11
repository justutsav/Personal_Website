"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MotionValue } from "framer-motion";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
} from "three";
import { SHOWCASE, SPACING, darken, type Service } from "@/components/showcaseData";

/* The WebGL half of the showcase. Lives in its own module so ShowcaseSection
 * can next/dynamic-import it — three + R3F (~150KB gzip) stay out of the
 * main bundle and never load at all on mobile (DOM carousel branch). */

const RADIUS = 5.5;

/* ---------- curved panel ---------- */

/** Wide plane bent toward the viewer — the "eyeball" curve. */
function useCurvedGeometry() {
  const geo = useMemo(() => {
    const g = new PlaneGeometry(4.4, 2.75, 32, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, -Math.pow(x / 2.2, 2) * 0.5);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
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
  ctx.fillText(entry.tag.toUpperCase().split("").join(" "), MID, 130);

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

  // R3F auto-disposes mesh geometry/material on unmount but NOT material.map
  // textures — without this, every home→about→home navigation leaks the three
  // CanvasTextures per panel (~30MB VRAM per round trip).
  useEffect(
    () => () => {
      auroraTex.dispose();
      fgTex.dispose();
      haloTex.dispose();
      backMat.dispose();
      frontMat.dispose();
      haloMat.dispose();
      haloGeo.dispose();
    },
    [auroraTex, fgTex, haloTex, backMat, frontMat, haloMat, haloGeo]
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

export default function ShowcaseArc({
  rotation,
  running,
}: {
  rotation: MotionValue<number>;
  running: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 40 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      className="!pointer-events-none"
      eventSource={document.body}
      eventPrefix="client"
      // section offscreen → stop the render loop entirely; five useFrame
      // panels at 60fps for the whole session was the site's biggest drain
      frameloop={running ? "always" : "never"}
      onCreated={({ gl }) => {
        // Android/backgrounded tabs can drop the GL context; preventDefault
        // tells the browser we want it restored instead of staying black
        gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
      }}
    >
      <Ring rotation={rotation} />
    </Canvas>
  );
}
