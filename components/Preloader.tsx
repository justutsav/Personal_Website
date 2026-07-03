"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Session preloader: counter runs 0→100 while the wordmark reveals,
 * then the curtain lifts. Shown once per browser session; skipped for
 * reduced-motion users.
 */
export function Preloader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce || sessionStorage.getItem("preloaded")) return;
    setShow(true);
    document.documentElement.style.overflow = "hidden";

    // non-linear count-up: fast start, hesitation, snap to 100
    let value = 0;
    const tick = () => {
      const step =
        value < 60 ? Math.random() * 14 + 4 : value < 90 ? Math.random() * 6 + 1 : 2;
      value = Math.min(100, value + step);
      setCount(Math.floor(value));
      if (value < 100) {
        timer = window.setTimeout(tick, 90 + Math.random() * 120);
      } else {
        timer = window.setTimeout(() => {
          setShow(false);
          sessionStorage.setItem("preloaded", "1");
          document.documentElement.style.overflow = "";
        }, 450);
      }
    };
    let timer = window.setTimeout(tick, 120);
    return () => {
      clearTimeout(timer);
      document.documentElement.style.overflow = "";
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
