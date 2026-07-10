"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HERO_PRELOAD_SRCS } from "@/data/heroMedia";

/** Never hold the curtain longer than this — a stalled/broken clip on a slow
 *  network must not trap the user on the loading screen. */
const MAX_WAIT_MS = 8000;
/** Floor so a warm cache doesn't flash the preloader for a single frame. */
const MIN_SHOW_MS = 700;

/**
 * Session preloader: the counter is tied to *real* asset readiness. It warms
 * the first hero clips off-DOM (which also fills the browser cache the hero's
 * <video> reuses) and only completes once they can play — so the site is
 * revealed with its opening frame ready, not mid-download. The count-up stalls
 * at a ceiling per clip loaded (0 → 70, 1 → 88, 2 → 100) so the wait reads as
 * honest progress. Shown once per session; skipped for reduced-motion users.
 */
export function Preloader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce || sessionStorage.getItem("preloaded")) return;
    setShow(true);
    document.documentElement.style.overflow = "hidden";

    const start = Date.now();
    const total = HERO_PRELOAD_SRCS.length;
    let ready = 0;

    // Warm the leading hero clips. `canplay` = enough buffered to start;
    // errors count as "ready" too so one bad source can't wedge the gate.
    const videos = HERO_PRELOAD_SRCS.map((src) => {
      const v = document.createElement("video");
      v.muted = true;
      v.preload = "auto";
      const onReady = () => {
        v.removeEventListener("canplay", onReady);
        v.removeEventListener("error", onReady);
        ready += 1;
      };
      v.addEventListener("canplay", onReady);
      v.addEventListener("error", onReady);
      v.src = src;
      v.load();
      return { v, onReady };
    });

    // non-linear count-up: fast start, hesitation near the ceiling, snap to 100
    let value = 0;
    const tick = () => {
      const elapsed = Date.now() - start;
      const forced = elapsed >= MAX_WAIT_MS;
      const allReady = total === 0 || ready >= total;
      // ceiling gates the counter to real progress until the clips land
      const ceiling = forced || allReady ? 100 : ready === total - 1 ? 88 : 70;
      const step =
        value < 60 ? Math.random() * 14 + 4 : value < 90 ? Math.random() * 6 + 1 : 2;
      value = Math.min(ceiling, value + step);
      setCount(Math.floor(value));

      if (value >= 100 && (forced || allReady) && elapsed >= MIN_SHOW_MS) {
        timer = window.setTimeout(() => {
          setShow(false);
          sessionStorage.setItem("preloaded", "1");
          document.documentElement.style.overflow = "";
        }, 450);
      } else {
        timer = window.setTimeout(tick, 90 + Math.random() * 120);
      }
    };
    let timer = window.setTimeout(tick, 120);

    return () => {
      clearTimeout(timer);
      document.documentElement.style.overflow = "";
      videos.forEach(({ v, onReady }) => {
        v.removeEventListener("canplay", onReady);
        v.removeEventListener("error", onReady);
        v.removeAttribute("src");
        v.load(); // release the buffer we were holding
      });
    };
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col justify-between bg-[var(--paper)] px-[var(--edge)] py-10"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex items-baseline justify-between font-mono text-micro uppercase tracking-[0.25em] text-ink-soft">
            <span>justutsav</span>
            <span>portfolio — 2026</span>
          </div>

          <div className="overflow-hidden">
            <motion.p
              className="font-display text-[clamp(3rem,10vw,9rem)] font-extrabold uppercase leading-none"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              UTSAV<span className="text-accent">.</span>
            </motion.p>
          </div>

          <div className="flex items-end justify-between">
            <span className="font-mono text-micro uppercase tracking-[0.25em] text-ink-soft">
              loading experience
            </span>
            <span className="font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold text-accent tabular-nums">
              {count}%
            </span>
          </div>

          {/* progress hairline */}
          <motion.span
            className="absolute bottom-0 left-0 h-[2px] bg-accent"
            animate={{ width: `${count}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
