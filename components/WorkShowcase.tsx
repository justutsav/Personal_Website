"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  MotionValue,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import type { Project } from "@/data/projects";
import { MOBILE_QUERY, useMediaQuery } from "@/components/useMediaQuery";
import { Magnetic } from "@/components/Magnetic";

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
  astro: { bg: "#5a2b86", ink: "#f6ecff", soft: "rgba(246,236,255,0.74)" },
  splitfree: { bg: "#0e8f7e", ink: "#eafff9", soft: "rgba(234,255,249,0.72)" },
  justtrade: { bg: "#ff5a24", ink: "#1a0e08", soft: "rgba(26,14,8,0.72)" },
  justfinance: { bg: "#2b3b8f", ink: "#eef2ff", soft: "rgba(238,242,255,0.7)" },
};
const FALLBACK: Palette = { bg: "#2b2b2b", ink: "#ffffff", soft: "rgba(255,255,255,0.7)" };

/** Remember where the deck was scrolled to so a case study's Back button can
 * re-seat the user on the exact card they opened (see CaseBack). */
function rememberReturn() {
  try {
    sessionStorage.setItem("work:returnY", String(window.scrollY));
  } catch {
    /* storage blocked — Back falls back to the section top */
  }
}

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
          loading="lazy"
          decoding="async"
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
  // hover state drives the button's invert (white bg + card-colour text) — a
  // static hover: class can't pick the per-card palette, and dark-ink cards
  // would vanish if we kept the ink colour on a white fill
  const [btnHover, setBtnHover] = useState(false);
  // these covers read better whole — show the full image (letterboxed in the
  // same 4:3 box) instead of top-cropping
  const coverContain = slug === "zentry-clone" || slug === "astro";
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
      onClick={() => {
        rememberReturn();
        router.push(`/work/${slug}`);
      }}
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

      {/* footer: a real magnetic button (mirrors the contact-page buttons).
          Bottom-right; inverts to a white fill on hover, palette-aware text. */}
      <div className="mt-4 flex justify-end">
        <Magnetic>
          <button
            onClick={(e) => {
              e.stopPropagation(); // own the nav so the card's handler doesn't double-fire
              rememberReturn();
              router.push(`/work/${slug}`);
            }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            data-cursor-label="open"
            className="hidden shrink-0 items-center gap-2 rounded-full border-2 px-7 py-3 font-mono text-small uppercase tracking-widest transition-colors duration-300 sm:inline-flex"
            style={{
              borderColor: btnHover ? "#ffffff" : pal.ink,
              backgroundColor: btnHover ? "#ffffff" : "transparent",
              color: btnHover ? pal.bg : pal.ink,
            }}
          >
            View case study →
          </button>
        </Magnetic>
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
  // asymmetric overlay exit: scrolling forward it LIFTS UP off-screen, but
  // returning from below it comes back rising from the BOTTOM. The side is
  // latched only while the overlay fully covers (e=0) or is fully gone (e=1),
  // so a mid-flight direction change never teleports it.
  const introDir = useRef(-1);
  const introY = useTransform(scrollYProgress, (p) => {
    const e = Math.min(Math.max((p - introEnd * 0.78) / (introEnd * 0.22), 0), 1);
    if (e <= 0) introDir.current = -1; // covering — next exit lifts up
    else if (e >= 1) introDir.current = 1; // gone — return rises from below
    return `${e * 115 * introDir.current}vh`;
  });

  // deck runs on the remaining scroll after the intro
  const deckProgress = useTransform(scrollYProgress, [introEnd, 1], [0, 1]);

  // mobile intro: same grow-in box, but the runway is INTRO_VH + one screen —
  // once the overlay slides off, the stage holds for that screen then scrolls
  // away naturally with the swipe stack seated inside it. Same asymmetric
  // exit as desktop: lifts up going forward, returns from below coming back.
  const introEndM = INTRO_VH / (INTRO_VH + 100);
  const boxScaleM = useTransform(scrollYProgress, [0, introEndM * 0.62], [0.6, 1.12]);
  const boxRadiusM = useTransform(scrollYProgress, [0, introEndM * 0.55], [40, 0]);
  const introDirM = useRef(-1);
  const introYM = useTransform(scrollYProgress, (p) => {
    const e = Math.min(Math.max((p - introEndM * 0.78) / (introEndM * 0.22), 0), 1);
    if (e <= 0) introDirM.current = -1;
    else if (e >= 1) introDirM.current = 1;
    return `${e * 115 * introDirM.current}vh`;
  });

  const [swipeIndex, setSwipeIndex] = useState(0);
  const [swipeExit, setSwipeExit] = useState(0);
  const swipeX = useMotionValue(0);
  const swipeRotate = useTransform(
    swipeX,
    [-480, -200, 0, 200, 480],
    [-18, -12, 0, 12, 18]
  );
  const underScale = useTransform(swipeX, [-140, 0, 140], [1, 0.94, 1]);
  const underY = useTransform(swipeX, [-140, 0, 140], [0, 16, 0]);
  const underDim = useTransform(swipeX, [-140, 0, 140], [1, 0.88, 1]);
  // under cards fan out sideways so their edges peek past the top card —
  // the "there's more beneath" cue; they tuck back in as the top card leaves
  const underX = useTransform(swipeX, [-140, 0, 140], [0, 14, 0]);
  const underRot = useTransform(swipeX, [-140, 0, 140], [0, 2.5, 0]);
  const tapStart = useRef({ x: 0, y: 0 });

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

  // mobile: the pinned deck's fixed-size cards can't fit a phone — swap to a
  // swipeable card stack (top 3 mounted); swipe to cycle, tap to open
  if (isMobile) {
    const len = projects.length;
    const active = swipeIndex % len;
    const flyX =
      swipeExit * (typeof window === "undefined" ? 480 : window.innerWidth) * 1.2;
    const stack = [2, 1, 0].map((depth) => {
      const pos = swipeIndex + depth;
      return {
        p: projects[pos % len],
        n: pos % len,
        depth,
        cycle: Math.floor(pos / len),
      };
    });

    // same intro as desktop: the "Selected work" box grows to full-bleed over
    // a pinned stage, then the whole overlay slides up to reveal the dark room
    // holding the swipeable stack; music latches via the marker as it enters
    return (
      // panel-ink (cream) so the subpixel sliver at the section's top edge
      // matches the stats section above — bg-paper (dark) showed as a 1px seam
      <section id="work" className="bg-panel-ink">
        <div
          ref={ref}
          className="relative"
          style={{ height: `calc(${INTRO_VH}vh + 100svh)` }}
        >
        {/* reached-latch marker — MusicProvider's startIO needs it on mobile too */}
        <div id="work-open" aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: "6%" }} />
        {/* pb clears the fixed music bar pinned to the viewport bottom */}
        <div className="sticky top-0 flex h-svh flex-col overflow-hidden bg-[#101010] px-[var(--edge)] pb-24 pt-16">
        {/* slim label — the intro overlay already announced the section full-screen */}
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-micro uppercase tracking-[0.35em] text-accent">
            Portfolio
          </p>
          <p className="font-mono text-micro uppercase tracking-[0.25em] text-ink-soft">
            Selected work
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative mt-6 min-h-0 flex-1"
        >
          {stack.map(({ p, n, depth, cycle }) => {
            const pal = PALETTES[p.slug] ?? FALLBACK;
            const isTop = depth === 0;
            const isNext = depth === 1;
            return (
              <motion.article
                key={`${p.slug}-${cycle}-${isTop ? "top" : "under"}`}
                drag={isTop && swipeExit === 0 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                dragMomentum={false}
                onDragEnd={
                  isTop
                    ? (_, info) => {
                        const dir =
                          info.offset.x > 90 || info.velocity.x > 500
                            ? 1
                            : info.offset.x < -90 || info.velocity.x < -500
                              ? -1
                              : 0;
                        if (dir) setSwipeExit(dir);
                      }
                    : undefined
                }
                animate={isTop && swipeExit !== 0 ? { x: flyX } : undefined}
                transition={{ duration: 0.34, ease: [0.3, 0.7, 0.3, 1] }}
                onAnimationComplete={
                  isTop
                    ? () => {
                        if (swipeExit !== 0) {
                          swipeX.set(0);
                          setSwipeExit(0);
                          setSwipeIndex((i) => i + 1);
                        }
                      }
                    : undefined
                }
                onPointerDown={
                  isTop
                    ? (e) => {
                        tapStart.current = { x: e.clientX, y: e.clientY };
                      }
                    : undefined
                }
                onClick={
                  isTop
                    ? (e) => {
                        const dx = e.clientX - tapStart.current.x;
                        const dy = e.clientY - tapStart.current.y;
                        if (Math.hypot(dx, dy) < 8 && swipeExit === 0) {
                          rememberReturn();
                          router.push(`/work/${p.slug}`);
                        }
                      }
                    : undefined
                }
                style={{
                  backgroundColor: pal.bg,
                  color: pal.ink,
                  ...(isTop
                    ? { x: swipeX, rotate: swipeRotate, zIndex: 3 }
                    : isNext
                      ? { scale: underScale, y: underY, x: underX, rotate: underRot, opacity: underDim, zIndex: 2 }
                      : { scale: 0.9, y: 26, x: -14, rotate: -2.5, opacity: 0.75, zIndex: 1 }),
                }}
                className="absolute inset-0 flex select-none flex-col overflow-hidden rounded-2xl p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className="font-mono text-micro uppercase tracking-[0.2em]"
                    style={{ color: pal.soft }}
                  >
                    {p.category} · {p.year}
                  </span>
                  <span className="font-mono text-micro" style={{ color: pal.soft }}>
                    {String(n + 1).padStart(2, "0")}/{String(len).padStart(2, "0")}
                  </span>
                </div>
                <Media
                  src={`/projects/${p.slug}/cover.webp`}
                  label={`${p.name} — cover`}
                  ink={pal.ink}
                  className="pointer-events-none mt-4 min-h-0 w-full"
                  style={{
                    aspectRatio: coverAspects?.[p.slug] ?? 16 / 10,
                    maxHeight: "38svh",
                  }}
                />
                <h3 className="font-display mt-4 text-3xl font-extrabold uppercase leading-none">
                  {p.name}
                </h3>
                <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                  {p.metrics.slice(0, 3).map((m) => (
                    <div key={m.label} className="flex items-baseline gap-1.5">
                      <dt className="font-display text-base font-extrabold">{m.value}</dt>
                      <dd
                        className="font-mono text-micro uppercase tracking-wide"
                        style={{ color: pal.soft }}
                      >
                        {m.label}
                      </dd>
                    </div>
                  ))}
                </dl>
                <span
                  className="mt-auto pt-4 font-mono text-micro uppercase tracking-[0.25em]"
                  style={{ color: pal.soft }}
                >
                  open case study →
                </span>
              </motion.article>
            );
          })}
        </motion.div>

        <div className="mt-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {projects.map((p, i) => (
              <span
                key={p.slug}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-5 bg-accent" : "w-1.5 bg-ink/25"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 font-mono text-micro uppercase tracking-[0.25em] text-ink-soft">
            <span>
              {String(active + 1).padStart(2, "0")}/{String(len).padStart(2, "0")}
            </span>
            <span className="opacity-60">swipe · tap to open</span>
          </div>
        </div>

        {/* intro: solid cream panel with the growing "Selected work" box;
            slides up as one opaque unit to reveal the stack — mirrors desktop */}
        <motion.div
          style={{ y: introYM, zIndex: 3000 }}
          className="absolute inset-0 flex items-center justify-center overflow-hidden bg-panel-ink"
        >
          <motion.div
            style={{ scale: boxScaleM, borderRadius: boxRadiusM }}
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
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

          {/* intro: solid cream panel with a growing black box; slides off as
              one opaque unit to reveal the deck (up going forward, back in
              from below when returning). No fades, nothing translucent. */}
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
