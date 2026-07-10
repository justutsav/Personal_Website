"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { HERO_PRELOAD_SRCS } from "@/data/heroMedia";

/* Circle-wipe (iris) intro: flat discs in the site's colours grow from the
 * centre past the screen edges, one chasing the next — each pass reads as an
 * expanding ring of the previous colour. They pass exactly once, then the
 * iris opens. The timeline NEVER waits on the network — hero clips warm in
 * the background and simply catch up. */
const WIPES = [
  "#ff5a24", // accent — coral orange
  "#5b8cff", // accent-2 — electric blue
  "#ffa7c9", // sakura pink
  "#f2ede2", // cream — the colour the site finally opens through
];

/* ---- TIMING KNOBS — tune to taste ---------------------------------------
 * WIPE_DUR  one circle's full flight (centre → past the screen edge), seconds.
 *           Bigger = slower, calmer circles.
 * WIPE_GAP  delay before the NEXT circle starts, seconds. Smaller = circles
 *           chase tighter (more ripple-like); bigger = more one-by-one.
 * The reveal is NOT a separate phase — the site itself is the 5th ripple
 * member: a hole with the same flight and the same stagger chases the cream
 * circle out, so there is never a held full-colour frame.                   */
const WIPE_DUR = 1.35;
const WIPE_GAP = 0.27;

/** when the reveal hole launches (seconds from load) — the hero syncs its
 * entrance choreography to this so it animates in AS the iris opens */
export const INTRO_REVEAL_START = WIPES.length * WIPE_GAP;

/**
 * Shown on EVERY visit for every user. `show` starts true so the overlay is
 * in the server HTML itself — the landing page can never flash before the
 * animation (first paint is the flat near-black screen the first circle grows
 * out of). Reduced-motion users get that brief still screen, then content.
 */
export function Preloader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);

  // reveal-hole radius (vmax); masks the overlay so the site shows through.
  // The discs' radius flies 0→160vmax (20vmax × scale 16 / 2) per flight, so
  // the hole running the same range/duration/ease IS the next ripple circle —
  // it trails the cream disc by exactly one stagger and can never overtake it.
  const hole = useMotionValue(0);
  const mask = useMotionTemplate`radial-gradient(circle at 50% 50%, transparent ${hole}vmax, #000 calc(${hole}vmax + 0.2vmax))`;

  useEffect(() => {
    if (reduce) {
      setShow(false);
      return;
    }
    document.documentElement.style.overflow = "hidden";

    // Best-effort: warm the leading hero clips while the colours run, filling
    // the cache the hero's <video> reuses. Purely background — the animation
    // timeline never blocks on it.
    const videos = HERO_PRELOAD_SRCS.map((src) => {
      const v = document.createElement("video");
      v.muted = true;
      v.preload = "auto";
      v.src = src;
      v.load();
      return v;
    });

    const anim = animate(hole, 160, {
      duration: WIPE_DUR,
      delay: WIPES.length * WIPE_GAP,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => {
        setShow(false);
        document.documentElement.style.overflow = "";
      },
    });

    return () => {
      anim.stop();
      document.documentElement.style.overflow = "";
      videos.forEach((v) => {
        v.removeAttribute("src");
        v.load(); // release the buffer we were holding
      });
    };
  }, [reduce, hole]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] overflow-hidden bg-[var(--paper)]"
          style={{ WebkitMaskImage: mask, maskImage: mask }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0 }}
        >
          {WIPES.map((c, i) => (
            <motion.span
              key={c}
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[20vmax] w-[20vmax] rounded-full"
              style={{
                background: c,
                // soft dark rim under each disc's edge — separates it from the
                // colour beneath so the stack reads as layers, not flat swaps
                // (scales with the transform, so it stays proportional)
                boxShadow: "0 0 14px 5px rgba(0,0,0,0.35)",
                willChange: "transform",
              }}
              initial={{ x: "-50%", y: "-50%", scale: 0 }}
              // scale 16 × 20vmax = 320vmax — well past any screen diagonal
              animate={{ x: "-50%", y: "-50%", scale: 16 }}
              transition={{
                duration: WIPE_DUR,
                delay: i * WIPE_GAP,
                ease: [0.65, 0, 0.35, 1],
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
