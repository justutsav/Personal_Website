"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { MOBILE_QUERY, useMediaQuery } from "@/components/useMediaQuery";
import { SHOWCASE, N, SPACING } from "@/components/showcaseData";

/** WebGL arc loads on demand (client-only) — keeps three/R3F out of the main
 * bundle entirely; mobile never fetches it since its branch never renders it */
const ShowcaseArc = dynamic(() => import("@/components/ShowcaseArc"), {
  ssr: false,
});

/** progress point where the last (6th) card seats in the front spot */
const LAST_AT = 0.63;
/** the 6th card then HOLDS from LAST_AT→HOLD_AT before any exit begins.
 * The stats wall (-mt-[140vh] on a 500vh section) becomes visible at
 * p = (500-140-100)/400 = 0.65, so the exit starts exactly then — any
 * longer hold reads as a frozen page (scroll input with zero motion). */
const HOLD_AT = 0.65;

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

  // pure snap with hysteresis: the seated card owns the front spot until the
  // scroll travels SNAP_H of the gap toward a neighbour, then the spring jumps
  // it in one decisive move — no partial drift, so the seated card is always
  // dead-centre and never creeps backwards before a flip. Works symmetrically
  // in both scroll directions. After the last card, rotation keeps going so it
  // exits while the cream wall lifts.
  const idxRef = useRef(0);
  const SNAP_H = 0.65;
  const snapIndex = (p: number) => {
    const f = Math.min((p / LAST_AT) * (N - 1), N - 1);
    let r = idxRef.current;
    while (r < N - 1 && f - r > SNAP_H) r++;
    while (r > 0 && r - f > SNAP_H) r--;
    idxRef.current = r;
    return r;
  };
  // live feedback: nudge the whole arc in the scroll direction proportional to
  // scroll VELOCITY (not position) — the card visibly leans with the wheel,
  // and because velocity decays to 0 the moment scrolling stops, the spring
  // always returns it to dead-centre. No positional offset → no backward creep.
  const scrollVelocity = useVelocity(scrollYProgress);
  const snapped = useTransform([scrollYProgress, scrollVelocity], ([p, v]: number[]) => {
    const r = snapIndex(p);
    const nudge = Math.max(-0.14, Math.min(0.14, v * 0.5));
    // 6th card holds through [LAST_AT, HOLD_AT]; exit only after the hold,
    // in lockstep with the cream wall lifting in.
    const exitP = Math.max(0, (p - HOLD_AT) / (1 - HOLD_AT));
    return (r + exitP * 0.9) * SPACING + nudge;
  });
  const rotation = useSpring(snapped, { stiffness: 180, damping: 26, mass: 0.7 });

  // Mount the Canvas only once the section approaches the viewport, then keep
  // it mounted but freeze its render loop while offscreen — remounting would
  // re-create the GL context + textures on every pass. (Also replaces the old
  // client-only `mounted` hydration guard: dynamic ssr:false covers SSR.)
  const [seen, setSeen] = useState(false);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { rootMargin: "25% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [active, setActive] = useState(0);
  // same hysteresis index as the 3D snap so the caption flips with the card
  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(snapIndex(p)));

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
          {seen && <ShowcaseArc rotation={rotation} running={inView} />}
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
