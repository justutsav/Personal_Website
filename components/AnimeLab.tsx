"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  createDraggable,
  createScope,
  createTimeline,
  stagger,
  svg,
  type Scope,
} from "animejs";

/**
 * LAB — anime.js test drive. Explicitly experimental: a self-contained
 * evaluation bench for the anime.js v4 animation engine. Four small demos,
 * each exercising a distinct part of the API. Everything is registered on a
 * single createScope() and reverted on unmount; with prefers-reduced-motion
 * the scope is never built, so each demo renders its static end state.
 */

const GRID_COLS = 12;
const GRID_ROWS = 5;
const GRID_CENTER = Math.floor((GRID_COLS * GRID_ROWS) / 2) + Math.floor(GRID_COLS / 2);

/* Monoline "anime" wordmark drawn as strokes (x-height 44–72, baseline 72). */
const WORD_PATHS = [
  "M108 58 a14 14 0 1 1 -28 0 a14 14 0 1 1 28 0 M108 44 V72", // a
  "M120 72 V44 M120 58 a13 13 0 0 1 26 0 V72", // n
  "M156 44 V72 M156 31 v0.01", // i
  "M168 72 V44 M168 55 a11 11 0 0 1 22 0 V72 M190 55 a11 11 0 0 1 22 0 V72", // m
  "M224 58 H252 A14 14 0 1 0 248.5 67.5", // e
];

function LabCard({
  no,
  title,
  caption,
  action,
  onAction,
  disabled,
  children,
}: {
  no: string;
  title: string;
  caption: string;
  action?: string;
  onAction?: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-paper-raised p-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <span className="font-mono text-micro tracking-widest text-accent-2">
            {no}
          </span>
          <h3 className="font-display mt-1 text-[length:var(--text-h3)] uppercase">
            {title}
          </h3>
        </div>
        {action && (
          <button
            type="button"
            onClick={onAction}
            disabled={disabled}
            data-cursor-label="run"
            className="shrink-0 font-mono text-micro uppercase tracking-widest text-accent transition-colors duration-200 hover:text-accent-deep disabled:opacity-40"
          >
            {action} ↻
          </button>
        )}
      </div>
      <div className="mt-5 flex-1">{children}</div>
      <p className="mt-5 border-t border-line pt-3 font-mono text-micro leading-relaxed text-ink-soft">
        {caption}
      </p>
    </div>
  );
}

export function AnimeLab() {
  const rootRef = useRef<HTMLElement>(null);
  const scopeRef = useRef<Scope | null>(null);
  // null = not yet known (SSR / first paint) — render static, build nothing.
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced !== false || !rootRef.current) return;

    const scope = createScope({ root: rootRef.current }).add((self) => {
      if (!self) return;

      /* 01 — SVG stroke drawing */
      const drawables = svg.createDrawable(".lab-draw path");
      const drawAnim = animate(drawables, {
        draw: ["0 0", "0 1"],
        ease: "inOutQuad",
        duration: 1000,
        delay: stagger(160),
        autoplay: false,
      });
      self.add("replayDraw", () => drawAnim.restart());

      /* 02 — stagger grid ripple, radiating from any cell index */
      self.add("ripple", (origin: number) => {
        animate(".lab-cell", {
          scale: [
            { to: 0.35, duration: 140, ease: "outQuad" },
            { to: 1, duration: 520, ease: "outElastic(1, .65)" },
          ],
          opacity: [
            { to: 1, duration: 140 },
            { to: 0.25, duration: 520 },
          ],
          delay: stagger(26, { grid: [GRID_COLS, GRID_ROWS], from: origin }),
        });
      });

      /* 03 — springy draggable chip, contained to its well */
      const chip = createDraggable(".lab-drag-chip", {
        container: ".lab-drag-well",
        containerPadding: 8,
        containerFriction: 0.4,
        releaseStiffness: 120,
      });
      self.add("resetDrag", () => chip.reset());

      /* 04 — timeline with overlapping offsets */
      const tl = createTimeline({
        autoplay: false,
        defaults: { ease: "outExpo", duration: 700 },
      })
        .add(".lab-tl-sq", { x: 72, rotate: 270, borderRadius: ["15%", "50%"] })
        .add(".lab-tl-bar", { scaleX: [0, 1] }, "-=450")
        .add(
          ".lab-tl-dot",
          { scale: [0, 1], ease: "outElastic(1, .5)", duration: 900 },
          "-=500"
        )
        .add(".lab-tl-tag", { opacity: [0, 1], y: [10, 0] }, "-=650");
      self.add("replayTimeline", () => tl.restart());

      /* First scroll into view kicks off the two sequenced demos once. */
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            drawAnim.play();
            tl.play();
            io.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      if (rootRef.current) io.observe(rootRef.current);
      return () => io.disconnect();
    });

    scopeRef.current = scope;
    return () => {
      scope.revert();
      scopeRef.current = null;
    };
  }, [reduced]);

  const run = (method: string, ...args: unknown[]) =>
    scopeRef.current?.methods[method]?.(...args);

  return (
    <section ref={rootRef} className="pb-[var(--section-gap)]">
      {/* ---- Section header ---- */}
      <div className="mb-10 flex flex-wrap items-baseline gap-x-5 gap-y-3">
        <h2 className="font-display text-[length:var(--text-h2)] uppercase">
          Lab — anime.js test drive
        </h2>
        <span className="rounded-full border border-accent-2 px-3 py-1 font-mono text-micro uppercase tracking-widest text-accent-2">
          experimental
        </span>
      </div>
      <p className="mb-10 max-w-[60ch] text-small text-ink-soft">
        Kicking the tires on{" "}
        <a
          href="https://animejs.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent transition-colors duration-200 hover:text-accent-deep"
        >
          anime.js v4
        </a>{" "}
        — a JavaScript animation engine for CSS, SVG and DOM. Four probes
        below, each poking a different corner of the API. May vanish or grow
        without notice.
        {reduced && (
          <span className="mt-2 block font-mono text-micro uppercase tracking-widest text-accent-2">
            reduced motion detected — demos parked in their end state
          </span>
        )}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* ---- 01 · SVG line drawing ---- */}
        <LabCard
          no="01"
          title="Stroke drawing"
          caption={'svg.createDrawable(paths) → animate({ draw: ["0 0", "0 1"], delay: stagger(160) })'}
          action="replay"
          onAction={() => run("replayDraw")}
          disabled={reduced !== false}
        >
          <div className="flex h-full min-h-40 items-center justify-center rounded-lg border border-line">
            <svg
              viewBox="0 0 320 110"
              className="lab-draw w-full max-w-90 text-accent"
              fill="none"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="the word anime drawn as strokes"
              role="img"
            >
              {WORD_PATHS.map((d) => (
                <path key={d} d={d} stroke="currentColor" />
              ))}
              <path
                d="M78 92 Q 160 104 252 86"
                stroke="var(--accent-2)"
              />
            </svg>
          </div>
        </LabCard>

        {/* ---- 02 · stagger grid ---- */}
        <LabCard
          no="02"
          title="Grid ripple"
          caption={"stagger(26, { grid: [12, 5], from: clickedIndex }) — click a cell to re-seed the wave"}
          action="from center"
          onAction={() => run("ripple", GRID_CENTER)}
          disabled={reduced !== false}
        >
          <div className="flex h-full min-h-40 items-center justify-center rounded-lg border border-line p-4">
            <div
              className="grid w-full max-w-90 gap-1.5"
              style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
            >
              {Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`ripple from cell ${i + 1}`}
                  onClick={() => run("ripple", i)}
                  disabled={reduced !== false}
                  className="lab-cell aspect-square rounded-[2px] bg-accent opacity-25"
                />
              ))}
            </div>
          </div>
        </LabCard>

        {/* ---- 03 · springy draggable ---- */}
        <LabCard
          no="03"
          title="Spring drag"
          caption={"createDraggable(chip, { container, containerFriction: 0.4, releaseStiffness: 120 }) — throw it at a wall"}
          action="reset"
          onAction={() => run("resetDrag")}
          disabled={reduced !== false}
        >
          <div className="lab-drag-well relative h-full min-h-40 overflow-hidden rounded-lg border border-line">
            <div
              data-cursor-label="drag"
              className="lab-drag-chip absolute left-4 top-4 flex h-14 w-14 items-center justify-center rounded-lg bg-accent-2 font-mono text-micro uppercase tracking-widest text-paper"
            >
              drag
            </div>
          </div>
        </LabCard>

        {/* ---- 04 · timeline sequence ---- */}
        <LabCard
          no="04"
          title="Timeline"
          caption={'createTimeline().add(sq, {…}).add(bar, {…}, "-=450").add(dot, {…}, "-=500") — overlapping offsets'}
          action="replay"
          onAction={() => run("replayTimeline")}
          disabled={reduced !== false}
        >
          <div className="flex h-full min-h-40 items-center rounded-lg border border-line px-6">
            <div className="flex w-full items-center gap-4">
              <div className="lab-tl-sq h-6 w-6 shrink-0 rounded-[15%] bg-accent" />
              <div className="lab-tl-bar h-px flex-1 origin-left bg-line-strong" />
              <div className="lab-tl-dot h-4 w-4 shrink-0 rounded-full bg-accent-2" />
              <span className="lab-tl-tag shrink-0 font-mono text-micro uppercase tracking-widest text-ink-soft">
                sequenced
              </span>
            </div>
          </div>
        </LabCard>
      </div>
    </section>
  );
}
