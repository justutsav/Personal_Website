"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import type { Project } from "@/data/projects";
import { MOBILE_QUERY, useMediaQuery } from "@/components/useMediaQuery";

/* ---------- punchy per-project palette ---------- */

type Palette = { bg: string; ink: string; soft: string };
// Card backgrounds picked from each project's real image palette (color
// theory: harmonize or complement the dominant tones, keep white/dark ink
// legible, no two deck cards share a hue).
//   grit      marigold — echoes the app's orange brand over cream shots
//   zentry    light lavender-white — flatters the warm-tan/lavender cover
//   atul      royal blue — matches the app's blue+green dashboards
//   astro     deep amethyst — pushes the cosmic purple, floats the gold moon
//   splitfree teal — the app's own accent, pops its cream screenshots
const PALETTES: Record<string, Palette> = {
  grit: { bg: "#e8a11c", ink: "#241606", soft: "rgba(36,22,6,0.72)" },
  "zentry-clone": { bg: "#dfdff0", ink: "#1a1330", soft: "rgba(26,19,48,0.7)" },
  "atul-finance": { bg: "#2833bd", ink: "#eef1ff", soft: "rgba(238,241,255,0.72)" },
  "astro-ai": { bg: "#5a2b86", ink: "#f6ecff", soft: "rgba(246,236,255,0.74)" },
  splitfree: { bg: "#0e8f7e", ink: "#eafff9", soft: "rgba(234,255,249,0.72)" },
  justtrade: { bg: "#ff5a24", ink: "#1a0e08", soft: "rgba(26,14,8,0.72)" },
  justfinance: { bg: "#2b3b8f", ink: "#eef2ff", soft: "rgba(238,242,255,0.7)" },
};
const FALLBACK: Palette = { bg: "#2b2b2b", ink: "#ffffff", soft: "rgba(255,255,255,0.7)" };

/* ---------- deck tuning knobs ----------
 * Adjust the feel of the card stack here.
 *   HOLD      — fraction of each card's scroll spent readable on top before it
 *               starts sliding away (higher = more read time, later exit)
 *   PEEK_Y    — how far each waiting card sits below the top one (px)
 *   SCALE_STEP— how much each waiting card shrinks per depth
 *   MAX_BEHIND— how many cards peek behind the top one (image: ~3)
 *   VH_PER_CARD — total scroll length per card (higher = slower, more scroll)
 */
const HOLD = 0.38;
/* peek must outrun the scale shrink: a card at depth d sits d·PEEK_Y lower but
 * is also (d·SCALE_STEP·height/2) shorter at the bottom — the visible band per
 * depth is PEEK_Y − SCALE_STEP·height/2 (≈26px at 1080p with these values) */
const PEEK_Y = 44;
const SCALE_STEP = 0.04;
const MAX_BEHIND = 2;
const VH_PER_CARD = 72;
/** scroll length of the intro (grow-in + read + slide-up) before the deck */
const INTRO_VH = 80;
/** fraction of the deck scroll used by card motion. The last card finishes
 * lifting slightly BEFORE the section ends so the timeline (which overlaps
 * this section with a negative margin) never covers a card mid-exit. */
const SETTLE = 0.9;

/* ---------- image placeholder (swaps to real upload on load) ---------- */

function Media({
  src,
  label,
  ink,
  className,
  style,
  crop = false,
}: {
  src: string;
  label: string;
  ink: string;
  className?: string;
  style?: React.CSSProperties;
  /** true → fill the slot, cropped from the TOP of the image (app header
   * stays visible); false → contain, whole image letterboxed */
  crop?: boolean;
}) {
  const [ok, setOk] = useState(true);

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[rgba(0,0,0,0.16)] ${className ?? ""}`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)", ...style }}
    >
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          onError={() => setOk(false)}
          className={`h-full w-full ${crop ? "object-cover object-top" : "object-contain"}`}
        />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center text-center font-mono text-micro uppercase tracking-widest"
          style={{ color: ink, opacity: 0.5 }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/* ---------- one card in the deck ----------
 * `head` (a fractional card index derived from scroll) drives everything.
 * rel = index - head:
 *   rel >= 0  → still in the deck; depth = rel, peeks below + behind the top
 *   rel <  0  → this card was on top and is now sliding up out of frame
 */
function DeckCard({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const router = useRouter();
  const pal = PALETTES[project.slug] ?? FALLBACK;
  const slug = project.slug;
  // these covers read better whole — show the full image (letterboxed in the
  // same 4:3 box) instead of top-cropping
  const coverContain = slug === "zentry-clone" || slug === "astro-ai";
  // landscape screenshots read better stacked whole than cropped into vertical
  // tiles — zentry's shots are 16:9
  const stackShots = slug === "zentry-clone";

  const head = (p: number) => {
    const pp = Math.min(p / SETTLE, 1); // reserve a scroll tail after the last card
    const raw = pp * total;
    const i = Math.min(Math.floor(raw), total - 1);
    const f = raw - i;
    const adv = f < HOLD ? 0 : (f - HOLD) / (1 - HOLD);
    return i + adv;
  };

  const y = useTransform(progress, (p) => {
    const rel = index - head(p);
    if (rel >= 0) return `${Math.min(rel, MAX_BEHIND) * PEEK_Y}px`;
    return `${-Math.min(-rel, 1) * 115}vh`; // slide up and out
  });
  const scale = useTransform(progress, (p) => {
    const rel = index - head(p);
    if (rel >= 0) return 1 - Math.min(rel, MAX_BEHIND) * SCALE_STEP;
    return 1;
  });
  const rotate = useTransform(progress, (p) => {
    const rel = index - head(p);
    return rel >= 0 ? 0 : -Math.min(-rel, 1) * 4;
  });
  const zIndex = useTransform(progress, (p) => {
    const rel = index - head(p);
    return rel < 0 ? 1000 : 500 - Math.round(rel); // exiting card rides on top
  });

  return (
    <motion.article
      onClick={() => router.push(`/work/${slug}`)}
      data-cursor-label="click"
      style={{
        backgroundColor: pal.bg,
        color: pal.ink,
        y,
        scale,
        rotate,
        zIndex,
        width: "min(88rem, 92vw)",
        height: "82vh", // uniform card size — equal heights keep the stack peek even
      }}
      className="absolute flex cursor-pointer flex-col overflow-hidden rounded-[2rem] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.55)] md:p-12"
    >
      {/* header row */}
      <div className="flex items-start justify-between">
        <span
          className="font-mono text-small uppercase tracking-[0.25em]"
          style={{ color: pal.soft }}
        >
          {project.category} · {project.year}
        </span>
        <span
          className="shrink-0 font-mono text-small uppercase tracking-[0.25em]"
          style={{ color: pal.soft }}
        >
          {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
      </div>

      {/* body: text left, big media right */}
      <div className="mt-6 grid min-h-0 flex-1 gap-8 md:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col">
          <h3 className="font-display text-[clamp(2rem,5vw,4rem)] font-extrabold uppercase leading-[0.95]">
            {project.name}
          </h3>
          <p className="mt-4 max-w-[42ch] text-[length:var(--text-body)]" style={{ color: pal.soft }}>
            {project.tagline}
          </p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {project.metrics.slice(0, 3).map((m) => (
              <div key={m.label}>
                <dt className="font-display text-2xl font-extrabold">{m.value}</dt>
                <dd className="font-mono text-micro uppercase tracking-wide" style={{ color: pal.soft }}>
                  {m.label}
                </dd>
              </div>
            ))}
          </dl>

          {/* small image row. Default: three 4:5 tiles side-by-side, top-cropped.
              Landscape decks (zentry) instead stack the whole 16:9 shots one
              below the other, centered and a touch larger. The absolute-inset
              wrapper gives the area a DEFINITE height so nothing overflows. */}
          <div className="relative mt-6 min-h-0 flex-1">
            {stackShots ? (
              // 2×2 grid of whole 16:9 shots; the 4th slot is left intentionally
              // empty (a photo drops in later as 04) — nothing rendered there
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center justify-center overflow-hidden">
                    <Media
                      src={`/projects/${slug}/0${n}.webp`}
                      label={`shot ${n}`}
                      ink={pal.ink}
                      className="max-h-full w-full"
                      style={{ aspectRatio: "16 / 9" }}
                    />
                  </div>
                ))}
                <div aria-hidden />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center gap-4">
                {[1, 2, 3].map((n) => (
                  <Media
                    key={n}
                    src={`/projects/${slug}/0${n}.webp`}
                    label={`shot ${n}`}
                    ink={pal.ink}
                    className="h-full max-w-[31.5%] shrink-0"
                    style={{ aspectRatio: "4 / 5" }}
                    crop
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* big cover media — same 4:3 slot on every card, cropped from the
            top of the image. Pinned to the TOP of its column so the freed
            space below carries the build detail (stack + one-line summary). */}
        <div className="flex min-h-0 flex-col">
          <Media
            src={`/projects/${slug}/cover.webp`}
            label={`${project.name} — cover`}
            ink={pal.ink}
            className="w-full shrink-0"
            style={{ aspectRatio: "4 / 3", maxHeight: "46vh" }}
            crop={!coverContain}
          />

          {/* detail block filling the negative space under the cover */}
          <div className="mt-6 flex min-h-0 flex-1 flex-col justify-start">
            <span
              className="font-mono text-micro uppercase tracking-[0.25em]"
              style={{ color: pal.soft }}
            >
              Built with
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border px-3 py-1 font-mono text-micro"
                  style={{ borderColor: pal.soft, color: pal.ink }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* footer: view case study lives bottom-right, number sits top-right.
          Styled as a clear pill button (mirrors "view about me"), palette-aware. */}
      <div className="mt-4 flex justify-end">
        <span
          className="hidden shrink-0 items-center gap-2 rounded-full border-2 px-7 py-3 font-mono text-small uppercase tracking-widest sm:inline-flex"
          style={{ borderColor: pal.ink, color: pal.ink }}
        >
          View case study →
        </span>
      </div>
    </motion.article>
  );
}

/* ---------- section ----------
 * One pinned stage. Phase 1 (intro): a black box holding "Selected work"
 * grows on a beige backdrop until it fills the screen, backdrop fading to
 * black; the box then fades out to reveal the deck already seated. Phase 2:
 * the playing-card deck plays. Everything in a single sticky so the growth
 * always completes before the deck and there is no empty gap.
 */
export function WorkShowcase({
  projects,
  coverAspects,
}: {
  projects: Project[];
  /** slug → real cover.webp aspect ratio (width/height), read server-side */
  coverAspects?: Record<string, number>;
}) {
  const reduce = useReducedMotion();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const total = INTRO_VH + projects.length * VH_PER_CARD;
  const introEnd = INTRO_VH / total;

  // intro overlay: a solid cream panel with a black box (holding "Selected
  // work") growing inside it to full-bleed. No opacity fades anywhere — the
  // whole overlay slides up and off as one solid unit, revealing the deck on
  // pure black. Nothing translucent ever sits over the cards.
  const boxScale = useTransform(scrollYProgress, [0, introEnd * 0.62], [0.6, 1.12]);
  const boxRadius = useTransform(scrollYProgress, [0, introEnd * 0.55], [40, 0]);
  const introY = useTransform(
    scrollYProgress,
    [introEnd * 0.78, introEnd],
    ["0vh", "-115vh"]
  );

  // deck runs on the remaining scroll after the intro
  const deckProgress = useTransform(scrollYProgress, [introEnd, 1], [0, 1]);

  if (reduce) {
    return (
      <section id="work" className="bg-paper px-[var(--edge)] py-[var(--section-gap)]">
        <h2 className="font-display mb-10 text-[length:var(--text-h1)] font-extrabold uppercase">
          Selected work
        </h2>
        <ul className="space-y-6">
          {projects.map((p) => (
            <li key={p.slug}>
              <span className="font-display text-2xl font-bold">{p.name}</span>{" "}
              — <span className="text-ink-soft">{p.tagline}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // mobile: the pinned deck's fixed-size cards can't fit a phone — swap to
  // simple stacked cards (cover + title + metrics), auto height, tap to open
  if (isMobile) {
    return (
      <section id="work" className="bg-panel-ink px-[var(--edge)] py-[var(--section-gap)]">
        <p className="font-mono text-micro uppercase tracking-[0.35em] text-accent">
          Portfolio
        </p>
        <h2 className="font-display mt-3 mb-10 text-[clamp(2.2rem,10vw,3.5rem)] font-extrabold uppercase leading-[0.95] text-ink-on-panel">
          Selected work
        </h2>
        <div className="space-y-6">
          {projects.map((p, i) => {
            const pal = PALETTES[p.slug] ?? FALLBACK;
            return (
              <article
                key={p.slug}
                onClick={() => router.push(`/work/${p.slug}`)}
                className="cursor-pointer overflow-hidden rounded-2xl p-5"
                style={{ backgroundColor: pal.bg, color: pal.ink }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-micro uppercase tracking-[0.2em]" style={{ color: pal.soft }}>
                    {p.category} · {p.year}
                  </span>
                  <span className="font-mono text-micro" style={{ color: pal.soft }}>
                    {String(i + 1).padStart(2, "0")}/{String(projects.length).padStart(2, "0")}
                  </span>
                </div>
                <Media
                  src={`/projects/${p.slug}/cover.webp`}
                  label={`${p.name} — cover`}
                  ink={pal.ink}
                  className="mt-4 w-full"
                  style={{ aspectRatio: coverAspects?.[p.slug] ?? 16 / 10, maxHeight: "60vh" }}
                />
                <h3 className="font-display mt-4 text-2xl font-extrabold uppercase leading-none">
                  {p.name}
                </h3>
                <p className="mt-2 text-small" style={{ color: pal.soft }}>
                  {p.tagline}
                </p>
                <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {p.metrics.slice(0, 3).map((m) => (
                    <div key={m.label}>
                      <dt className="font-display text-lg font-extrabold">{m.value}</dt>
                      <dd className="font-mono text-micro uppercase tracking-wide" style={{ color: pal.soft }}>
                        {m.label}
                      </dd>
                    </div>
                  ))}
                </dl>
                <span
                  className="mt-4 inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 font-mono text-micro uppercase tracking-widest"
                  style={{ borderColor: pal.ink, color: pal.ink }}
                >
                  View case study →
                </span>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="bg-paper">
      <div ref={ref} className="relative" style={{ height: `${total}vh` }}>
        {/* marker: music starts as you begin scrolling the "Selected Work" box */}
        <div id="work-open" aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: "6%" }} />
        <div
          className="sticky top-0 flex h-screen items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#0e0d0b" }}
        >
          {/* deck cards on solid black — always fully opaque, never veiled */}
          {projects.map((p, i) => (
            <DeckCard
              key={p.slug}
              project={p}
              index={i}
              total={projects.length}
              progress={deckProgress}
            />
          ))}

          {/* intro: solid cream panel with a growing black box; slides up as
              one opaque unit to reveal the deck. No fades, nothing translucent. */}
          <motion.div
            style={{ y: introY, zIndex: 3000 }}
            className="absolute inset-0 flex items-center justify-center overflow-hidden bg-panel-ink"
            aria-hidden={false}
          >
            <motion.div
              style={{ scale: boxScale, borderRadius: boxRadius }}
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              // black box grows to cover the cream panel
            >
              <div className="absolute inset-0 bg-paper" />
              <div className="relative text-center">
                <p className="font-mono text-micro uppercase tracking-[0.35em] text-accent">
                  Portfolio
                </p>
                <h2 className="font-display mt-4 text-[clamp(2.5rem,9vw,8rem)] font-extrabold uppercase leading-[0.9] text-ink">
                  Selected<br />work
                </h2>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
