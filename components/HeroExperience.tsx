"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { COARSE_QUERY, useMediaQuery } from "@/components/useMediaQuery";
import { HERO_MEDIA, type HeroMedia as Media } from "@/data/heroMedia";
import { INTRO_REVEAL_START } from "@/components/Preloader";

const roles = ["WEBSITES", "DASHBOARDS", "MOBILE APPS", "AI AUTOMATION", "CUSTOM TOOLS"];

/** entrance choreography starts as the intro's iris begins to open, so the
 * card/wordmark are still settling into place while the colour peels away —
 * nothing "just sits there" when the reveal lands */
const ENTER = INTRO_REVEAL_START + 0.15;

/**
 * Media cycles in order per session (index kept in sessionStorage); clicking
 * the card advances to the next. Hovering reveals the NEXT clip through a
 * small lens around the cursor. Broken sources auto-skip. The pool itself
 * lives in data/heroMedia.ts so the Preloader can warm the first clips.
 */
const SESSION_KEY = "hero-media-index";

/* ---------- falling sakura petals (very few) ---------- */

function Petals() {
  const petals = [
    { left: "12%", delay: 0, dur: 13, size: 16, drift: 40 },
    { left: "34%", delay: 4, dur: 16, size: 12, drift: -30 },
    { left: "58%", delay: 2, dur: 15, size: 18, drift: 55 },
    { left: "72%", delay: 7, dur: 12, size: 14, drift: -45 },
    { left: "88%", delay: 5, dur: 17, size: 11, drift: 25 },
    { left: "46%", delay: 9, dur: 14, size: 15, drift: -20 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-[-6%] block"
          style={{ left: p.left, width: p.size, height: p.size }}
          initial={{ y: "-10vh", x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: "112vh",
            x: [0, p.drift, -p.drift * 0.6, p.drift * 0.4],
            rotate: [0, 180, 360, 540],
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
            <path
              d="M16 2c4 6 10 8 12 14-4 2-8 2-12 8-4-6-8-6-12-8C6 10 12 8 16 2Z"
              fill="var(--sakura)"
              opacity="0.85"
            />
          </svg>
        </motion.span>
      ))}
    </div>
  );
}

/** Renders one media entry (video plays, image static). `still` keeps a
 *  video paused on its first frame — used for the hover-lens preview. */
function MediaLayer({
  media,
  still = false,
  onError,
  videoRef,
}: {
  media: Media;
  still?: boolean;
  onError?: () => void;
  videoRef?: React.Ref<HTMLVideoElement>;
}) {
  if (media.type === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        className="h-full w-full scale-105 object-cover saturate-[0.95]"
        src={media.src}
        alt=""
        onError={onError}
      />
    );
  }
  return (
    <video
      ref={videoRef}
      className="h-full w-full scale-105 object-cover saturate-[0.95]"
      src={media.src}
      autoPlay={!still}
      loop={!still}
      muted
      playsInline
      // still = permanently-mounted lens preview: "auto" would eagerly pull
      // whole next clip (MBs) on load; metadata is enough for a first frame
      preload={still ? "metadata" : "auto"}
      onError={onError}
    />
  );
}

/**
 * Single-screen hero. A gently wobbling card wraps the wordmark and cycles
 * through looping clips; hovering peeks at the next clip through a lens.
 * "I build … people actually use" sits below the card; few sakura petals
 * drift over the near-black canvas.
 */
export function HeroExperience() {
  const reduce = useReducedMotion();
  // touch devices: no real hover — kill the cursor tilt + next-clip lens peek
  // (they misfire on synthesized touch events). Tap-to-advance still works.
  const coarse = useMediaQuery(COARSE_QUERY);

  // offscreen hero = every infinite loop (grain, scan, petals, float, glyph,
  // role interval, video decode) burning CPU for nothing — gate them all here
  const heroRef = useRef<HTMLElement>(null);
  const inView = useInView(heroRef);

  /* rotating role word */
  const [role, setRole] = useState(0);
  useEffect(() => {
    if (reduce || !inView) return;
    const id = setInterval(() => setRole((r) => (r + 1) % roles.length), 1800);
    return () => clearInterval(id);
  }, [reduce, inView]);

  /* cycle through media in order, persist position for the session */
  const [mediaIndex, setMediaIndex] = useState(0);
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored !== null) setMediaIndex(Number(stored) % HERO_MEDIA.length);
  }, []);

  const advance = (dir = 1) => {
    setMediaIndex((i) => {
      const next = (i + dir + HERO_MEDIA.length) % HERO_MEDIA.length;
      sessionStorage.setItem(SESSION_KEY, String(next));
      return next;
    });
  };

  // if every source errors, advance() would remount → error → advance forever;
  // once all indices have failed, stop cycling and stay put
  const failedMedia = useRef(new Set<number>());
  const onMediaError = () => {
    failedMedia.current.add(mediaIndex);
    if (failedMedia.current.size >= HERO_MEDIA.length) return;
    advance(1);
  };

  const media = HERO_MEDIA[mediaIndex];
  const nextMedia = HERO_MEDIA[(mediaIndex + 1) % HERO_MEDIA.length];

  /* pause the active clip while scrolled away (it keeps decoding otherwise);
     resume on return — unless the tab itself is hidden */
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = activeVideoRef.current;
    if (!v) return;
    if (!inView) v.pause();
    else if (!document.hidden) v.play().catch(() => {});
  }, [inView, mediaIndex]);

  /* gentle wobble toward the cursor */
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 90, damping: 14, mass: 0.7 });
  const sry = useSpring(ry, { stiffness: 90, damping: 14, mass: 0.7 });
  const rotateX = useTransform(srx, (v) => `${v}deg`);
  const rotateY = useTransform(sry, (v) => `${v}deg`);

  /* lens position (px within card) for the next-clip peek */
  const lx = useMotionValue(-999);
  const ly = useMotionValue(-999);
  const lens = useMotionTemplate`radial-gradient(circle 120px at ${lx}px ${ly}px, #000 42%, transparent 72%)`;
  const [hovering, setHovering] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  /* scroll: the card arcs up + curves as you leave the hero */
  const { scrollYProgress: hp } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const scrollY = useTransform(hp, [0, 1], ["0vh", "-42vh"]);
  const scrollX = useTransform(hp, [0, 1], ["0vw", "-6vw"]);
  const scrollRot = useTransform(hp, [0, 1], [0, -9]); // curve/tilt while rising
  const scrollScale = useTransform(hp, [0, 1], [1, 0.82]);
  const scrollOpacity = useTransform(hp, [0, 0.85], [1, 0]);

  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!reduce) {
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      ry.set(nx * 4); // slight tilt left/right
      rx.set(-ny * 3); // slight tilt up/down
    }
    lx.set(e.clientX - r.left);
    ly.set(e.clientY - r.top);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    setHovering(false);
  };

  return (
    <section
      ref={heroRef}
      className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-paper"
    >
      {!reduce && inView && <Petals />}

      {/* convex "bulge" clip — panel swells from the middle, like the
          showcase cards below (responsive via objectBoundingBox) */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="bulge" clipPathUnits="objectBoundingBox">
            <path d="M0,0.09 Q0.5,-0.03 1,0.09 L1,0.91 Q0.5,1.03 0,0.91 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* scroll wrapper: arcs the card up + curves it as the hero leaves */}
      <motion.div
        style={{
          y: scrollY,
          x: scrollX,
          rotate: scrollRot,
          scale: scrollScale,
          opacity: scrollOpacity,
          filter: "drop-shadow(0 38px 90px rgba(0,0,0,0.55))",
        }}
        className="relative"
      >
        {/* entrance: the card rises + swells into place while the iris opens */}
        <motion.div
          style={{ perspective: 1000 }}
          className="relative"
          initial={reduce ? false : { y: 64, scale: 0.92, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ delay: ENTER, duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            ref={cardRef}
            onClick={() => advance(1)}
            onMouseEnter={coarse ? undefined : () => setHovering(true)}
            onMouseMove={coarse ? undefined : onMove}
            onMouseLeave={coarse ? undefined : onLeave}
            className="group relative w-[88vw] cursor-pointer overflow-hidden md:w-[min(60vw,44rem)]"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              aspectRatio: "16 / 7.6",
              clipPath: "url(#bulge)",
            }}
            animate={reduce || !inView ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
          {/* current media */}
          <AnimatePresence mode="wait">
            <motion.div
              key={media.src}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MediaLayer media={media} onError={onMediaError} videoRef={activeVideoRef} />
            </motion.div>
          </AnimatePresence>

          {/* lens: next clip's first frame revealed around the cursor */}
          {!reduce && !coarse && (
            <motion.div
              className="absolute inset-0"
              style={{
                opacity: hovering ? 1 : 0,
                WebkitMaskImage: lens,
                maskImage: lens,
                transition: "opacity 0.25s ease",
              }}
              aria-hidden
            >
              <MediaLayer media={nextMedia} still />
              <span className="absolute inset-0 ring-1 ring-white/20" />
            </motion.div>
          )}

          {/* readability wash */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(14,13,11,0.28) 0%, rgba(14,13,11,0.72) 100%)",
            }}
          />

          {/* convex sheen: light swell up top, shaded lower edges → looks bulged */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 12%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 45%), radial-gradient(140% 120% at 50% 100%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 55%)",
              mixBlendMode: "soft-light",
            }}
          />

          {/* TV texture: scanlines + drifting grain so the frame isn't plain */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(to bottom, rgba(0,0,0,0.14) 0px, rgba(0,0,0,0.14) 1px, transparent 1px, transparent 3px)",
              mixBlendMode: "overlay",
              opacity: 0.55,
            }}
          />
          {/* grain jitters via x/y transforms on an oversized layer (compositor
              only) — animating background-position repaints every frame. Layer
              overhangs by one 160px tile in each direction so the translate
              wraps seamlessly */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              inset: "-160px",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: "160px 160px",
              mixBlendMode: "overlay",
              opacity: 0.14,
            }}
            animate={
              reduce || !inView ? undefined : { x: ["0px", "160px"], y: ["0px", "-160px"] }
            }
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          />
          {/* faint rolling scan bar + flicker */}
          {!reduce && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)",
                mixBlendMode: "overlay",
              }}
              // y transform (compositor) instead of `top` (layout per frame);
              // bar is 1/3 card tall, so -100%..300% of self = -33%..100% of card
              animate={inView ? { y: ["-100%", "300%"] } : undefined}
              transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* wordmark, lifted off the card */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: "translateZ(40px)" }}
          >
            <motion.h1
              className="font-display relative inline-block text-center text-[clamp(2.6rem,10vw,8rem)] font-extrabold uppercase leading-[0.9]"
              initial={reduce ? false : { opacity: 0, y: "0.45em" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ENTER + 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="absolute top-[-0.28em] left-[0.06em] font-mono text-[0.16em] lowercase tracking-[0.4em] text-accent-2"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ENTER + 0.85, duration: 0.6 }}
              >
                just
              </motion.span>
              UTSAV<span className="text-accent">.</span>
              {/* the wordmark alone tells a crawler (or a screen reader)
                  nothing about the page — this rides along invisibly */}
              <span className="sr-only">
                {" "}
                — Utsav, an independent developer building web apps,
                dashboards, mobile apps and automation that businesses run on.
              </span>
            </motion.h1>
          </div>

          </motion.div>
        </motion.div>
      </motion.div>

      {/* hint: the frame is interactive — click to cycle clips */}
      <motion.p
        className="relative mt-5 flex items-center gap-2 font-mono uppercase text-ink-soft"
        style={{ fontSize: "clamp(0.58rem,1.1vw,0.72rem)", letterSpacing: "0.28em" }}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: ENTER + 1.0, duration: 0.7 }}
      >
        <motion.span
          aria-hidden
          className="text-accent-2"
          animate={reduce || !inView ? undefined : { rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          ↻
        </motion.span>
        Give the video a tap
      </motion.p>

      {/* tagline below the card, outside the box — rises in after the card */}
      <motion.div
        className="relative mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 text-center font-mono text-[clamp(0.72rem,1.4vw,1.1rem)] uppercase tracking-[0.18em] md:tracking-[0.25em]"
        initial={reduce ? false : { opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: ENTER + 0.65, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-ink-soft">I build</span>
        {/* slot resizes to the current word (layout-animated) so short words
            don't leave a big gap and long words never crop */}
        <motion.span
          layout
          transition={{ layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
          className="relative inline-flex h-[1.35em] items-center overflow-hidden text-accent-2"
        >
          <span aria-hidden className="invisible whitespace-nowrap">
            {roles[role]}
          </span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={role}
              className="absolute left-0 whitespace-nowrap"
              initial={reduce ? false : { y: "115%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-115%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {roles[role]}
            </motion.span>
          </AnimatePresence>
        </motion.span>
        <span className="text-ink-soft">people actually use</span>
      </motion.div>
    </section>
  );
}
