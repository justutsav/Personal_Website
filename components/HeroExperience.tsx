"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const Sakura3D = dynamic(() => import("@/components/Sakura3D"));

const roles = ["WEB APPS", "DASHBOARDS", "MOBILE APPS", "AUTOMATION", "AI TOOLS"];

/**
 * Single-screen hero: centered wordmark over the blurred sakura tree.
 * No pinned runway — scrolling moves straight into the showcase.
 */
export function HeroExperience() {
  const reduce = useReducedMotion();

  const [role, setRole] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setRole((r) => (r + 1) % roles.length), 1800);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
      {/* blurred sakura backdrop */}
      {!reduce && (
        <div className="absolute inset-0 blur-[5px] saturate-[0.9]">
          <Sakura3D />
        </div>
      )}
      {/* soft vignette so type stays readable over the tree */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(14,13,11,0.25) 0%, rgba(14,13,11,0.65) 100%)",
        }}
      />

      {/* centered wordmark */}
      <div className="relative text-center">
        <h1 className="font-display relative inline-block text-[clamp(4rem,16vw,15rem)] font-extrabold uppercase leading-[0.9]">
          <motion.span
            className="absolute -top-[0.28em] left-[0.06em] font-mono text-[0.16em] lowercase tracking-[0.4em] text-accent-2"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            just
          </motion.span>
          UTSAV<span className="text-accent">.</span>
        </h1>
        <div className="mt-6 flex items-center justify-center gap-4 font-mono text-[clamp(0.8rem,1.4vw,1.1rem)] uppercase tracking-[0.25em]">
          <span className="text-ink-soft">I build</span>
          <span className="relative inline-block h-[1.6em] min-w-[12ch] overflow-hidden text-left text-accent-2">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={role}
                className="absolute left-0"
                initial={reduce ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-110%" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {roles[role]}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="text-ink-soft">people actually use</span>
        </div>
      </div>
    </section>
  );
}
