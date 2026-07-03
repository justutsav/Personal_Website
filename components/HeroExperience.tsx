"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const Sakura3D = dynamic(() => import("@/components/Sakura3D"));

const roles = ["WEB APPS", "DASHBOARDS", "MOBILE APPS", "AUTOMATION", "AI TOOLS"];

/**
 * Scroll-driven hero: a 220vh runway with a pinned stage. Centered
 * wordmark over a blurred sakura tree; scrolling hands the stage to the
 * mission statement.
 */
export function HeroExperience() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // wordmark: full-bleed center → shrinks upward and fades out clean
  const nameScale = useTransform(scrollYProgress, [0, 0.75], [1, 0.55]);
  const nameY = useTransform(scrollYProgress, [0, 0.75], ["0vh", "-26vh"]);
  const nameOpacity = useTransform(scrollYProgress, [0.55, 0.85], [1, 0]);

  // tree recedes as you scroll
  const treeOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.7, 0]);
  const treeScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // cycling role word
  const [role, setRole] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setRole((r) => (r + 1) % roles.length), 1800);
    return () => clearInterval(id);
  }, [reduce]);

  if (reduce) {
    return (
      <section className="px-[var(--edge)] pt-[16vh] pb-[var(--section-gap)] text-center">
        <h1 className="font-display text-[length:var(--text-display)] font-extrabold uppercase">
          <span className="font-mono text-[0.2em] lowercase tracking-[0.3em] text-accent-2">
            just
          </span>
          UTSAV<span className="text-accent">.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-[46ch] text-ink-soft">
          I build software people actually use — web apps, dashboards, mobile
          apps and the servers under them, for real businesses.
        </p>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[150vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        {/* blurred sakura backdrop */}
        <motion.div
          className="absolute inset-0 blur-[5px] saturate-[0.9]"
          style={{ opacity: treeOpacity, scale: treeScale }}
        >
          <Sakura3D />
        </motion.div>
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
        <motion.div
          className="relative text-center"
          style={{ scale: nameScale, y: nameY, opacity: nameOpacity }}
        >
          <h1 className="font-display relative inline-block text-[clamp(4rem,16vw,15rem)] font-extrabold uppercase leading-[0.9]">
            <motion.span
              className="absolute -top-[0.28em] left-[0.06em] font-mono text-[0.16em] lowercase tracking-[0.4em] text-accent-2"
              initial={{ opacity: 0, y: 12 }}
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
                  initial={{ y: "110%" }}
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
        </motion.div>

        {/* scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 font-mono text-micro uppercase tracking-[0.25em] text-ink-soft"
          style={{ opacity: cueOpacity }}
        >
          <motion.span
            className="text-accent-2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            ↓
          </motion.span>
          scroll to explore
        </motion.div>
      </div>
    </section>
  );
}
