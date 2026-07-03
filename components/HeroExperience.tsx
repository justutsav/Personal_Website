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

const Hero3D = dynamic(() => import("@/components/Hero3D"));

const roles = ["WEB APPS", "DASHBOARDS", "MOBILE APPS", "AUTOMATION", "AI TOOLS"];

/**
 * Scroll-driven hero: a 220vh runway with a pinned stage. The giant
 * wordmark shrinks and drifts as you scroll while the mission statement
 * takes over — reading it is the experience, not a static banner.
 */
export function HeroExperience() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // wordmark: full-bleed → small kicker
  const nameScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.24]);
  const nameY = useTransform(scrollYProgress, [0, 0.55], ["0vh", "-30vh"]);
  const nameOpacity = useTransform(scrollYProgress, [0.55, 0.7], [1, 0]);

  // statement: rises in during the second half
  const stateY = useTransform(scrollYProgress, [0.45, 0.75], ["60vh", "0vh"]);
  const stateOpacity = useTransform(scrollYProgress, [0.45, 0.7], [0, 1]);

  // 3D + cue fade
  const blobOpacity = useTransform(scrollYProgress, [0, 0.5, 0.8], [1, 0.85, 0.25]);
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
      <section className="px-[var(--edge)] pt-[16vh] pb-[var(--section-gap)]">
        <h1 className="font-display text-[length:var(--text-display)] font-extrabold uppercase">
          Utsav<span className="text-accent">.</span>
        </h1>
        <p className="mt-8 max-w-[46ch] text-ink-soft">
          I build software people actually use — web apps, dashboards, mobile
          apps and the servers under them, for real businesses.
        </p>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* 3D sculpture */}
        <motion.div
          className="absolute inset-y-0 right-[-10vw] w-[65vw] md:right-[-2vw] md:w-[48vw]"
          style={{ opacity: blobOpacity }}
        >
          <Hero3D />
        </motion.div>

        {/* giant wordmark */}
        <motion.div
          className="relative origin-left px-[var(--edge)]"
          style={{ scale: nameScale, y: nameY, opacity: nameOpacity }}
        >
          <h1 className="font-display text-[clamp(4rem,15vw,14rem)] font-extrabold uppercase leading-[0.9]">
            UTSAV<span className="text-accent">.</span>
          </h1>
          <div className="mt-4 flex items-center gap-4 font-mono text-[clamp(0.8rem,1.4vw,1.1rem)] uppercase tracking-[0.25em]">
            <span className="text-ink-soft">I build</span>
            <span className="relative inline-block h-[1.6em] min-w-[12ch] overflow-hidden text-accent">
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
            <span className="text-ink-soft">that people actually use</span>
          </div>
        </motion.div>

        {/* mission statement, phase two */}
        <motion.div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-[var(--edge)]"
          style={{ y: stateY, opacity: stateOpacity }}
        >
          <p className="font-display max-w-[16ch] text-[clamp(2.2rem,5.5vw,5rem)] font-extrabold uppercase leading-[1.02]">
            Real businesses run on my code —{" "}
            <span className="text-accent">₹75L+</span> of other people&apos;s
            money included.
          </p>
          <p className="mt-8 max-w-[46ch] text-ink-soft">
            Not demos. Not tutorial projects. Investor portals, trading
            dashboards, Play Store apps — designed, built and kept running.
          </p>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          className="absolute bottom-8 left-[var(--edge)] flex items-center gap-3 font-mono text-micro uppercase tracking-[0.25em] text-ink-soft"
          style={{ opacity: cueOpacity }}
        >
          <motion.span
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
