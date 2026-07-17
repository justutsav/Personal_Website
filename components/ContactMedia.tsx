"use client";

import { useEffect, useRef, useState } from "react";
import { COARSE_QUERY, useMediaQuery } from "@/components/useMediaQuery";

/**
 * Contact portrait as a halftone-dot rendering (cream dots on the page's
 * near-black) that resolves into the real colour photo on hover — tap
 * toggles it on touch. Photo lives at /public/contact/me.jpg (or me.png);
 * soft placeholder until it lands.
 */
const SOURCES = ["/contact/me.jpg", "/contact/me.png"];

/** sample the photo's luminance on a fine grid, draw one dot per cell —
 * bright areas get big dots, shadows get none. Luminance is auto-contrast
 * stretched (2nd–98th percentile) first, so even a dark photo spreads across
 * the full dot range and facial features survive the halftoning. */
function drawHalftone(img: HTMLImageElement, canvas: HTMLCanvasElement) {
  const cell = 6;
  const W = 840;
  const H = Math.round((img.naturalHeight / img.naturalWidth) * W);
  const sw = Math.ceil(W / cell);
  const sh = Math.ceil(H / cell);

  const off = document.createElement("canvas");
  off.width = sw;
  off.height = sh;
  const octx = off.getContext("2d");
  const ctx = canvas.getContext("2d");
  if (!octx || !ctx) return;

  octx.drawImage(img, 0, 0, sw, sh);
  const data = octx.getImageData(0, 0, sw, sh).data;

  const lums = new Float32Array(sw * sh);
  for (let p = 0; p < lums.length; p++) {
    const i = p * 4;
    lums[p] =
      (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
  }
  const sorted = Float32Array.from(lums).sort();
  const lo = sorted[Math.floor(sorted.length * 0.02)];
  const hi = sorted[Math.floor(sorted.length * 0.98)];
  const range = Math.max(hi - lo, 0.01);

  canvas.width = W;
  canvas.height = H;
  const styles = getComputedStyle(document.documentElement);
  ctx.fillStyle = styles.getPropertyValue("--paper").trim() || "#0e0d0b";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = styles.getPropertyValue("--ink").trim() || "#f2ede2";
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const lum = Math.min(1, Math.max(0, (lums[y * sw + x] - lo) / range));
      // gamma < 1 lifts midtones — that's where faces live
      const r = (cell / 2) * Math.pow(lum, 0.72) * 0.95;
      if (r < 0.3) continue;
      ctx.beginPath();
      ctx.arc(x * cell + cell / 2, y * cell + cell / 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function ContactMedia() {
  const [srcIdx, setSrcIdx] = useState(0);
  const [resolved, setResolved] = useState(false); // touch: tap toggles
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // no hover on touch devices → they need a nudge (echoes the hero's
  // "give the video a tap"); desktop gets the cursor label instead
  const coarse = useMediaQuery(COARSE_QUERY);

  // a cached photo fires `load` BEFORE React attaches onLoad — redraw here
  // whenever the image is already complete (also re-renders after HMR)
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth && canvasRef.current) {
      drawHalftone(img, canvasRef.current);
    }
  }, [srcIdx]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {srcIdx < SOURCES.length ? (
        <div
          className="group relative h-full cursor-pointer"
          onClick={() => setResolved((r) => !r)}
          data-cursor-label="reveal"
        >
          {/* real colour photo, revealed as the dots dissolve */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            className="h-full w-auto rounded-3xl object-contain"
            src={SOURCES[srcIdx]}
            alt=""
            onError={() => setSrcIdx((i) => i + 1)}
            onLoad={(e) => {
              if (canvasRef.current) drawHalftone(e.currentTarget, canvasRef.current);
            }}
          />
          <canvas
            ref={canvasRef}
            aria-hidden
            className={`absolute inset-0 h-full w-full rounded-3xl transition-opacity duration-700 ease-out ${
              resolved ? "opacity-0" : "opacity-100 group-hover:opacity-0"
            }`}
          />
          {coarse && (
            <span
              className={`pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ink-soft transition-opacity duration-500 ${
                resolved ? "opacity-0" : "opacity-80"
              }`}
            >
              give the portrait a tap
            </span>
          )}
        </div>
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-3xl"
          style={{
            background:
              "radial-gradient(120% 120% at 80% 20%, #2b2b2b 0%, var(--paper) 70%)",
          }}
        >
          <span className="font-mono text-micro uppercase tracking-widest text-ink-soft">
            media coming soon
          </span>
        </div>
      )}
    </div>
  );
}
