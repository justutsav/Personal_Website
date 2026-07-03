"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import type { Project } from "@/data/projects";

/** Per-project placard colors for the hover preview (until screenshots land) */
const PREVIEW_TINTS: Record<string, string> = {
  "atul-finance": "#2f4a3e",
  justtrade: "#1e3a5f",
  grit: "#3d2c4f",
  splitfree: "#7a4a21",
  "astro-ai": "#4a2438",
  justfinance: "#31424a",
  justwhisper: "#44422a",
  "wpm-overlay": "#513529",
};

/**
 * Interactive work index: rows slide + fill on hover while a floating
 * preview placard chases the cursor. Cursor badge shows "view".
 */
export function WorkList({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<Project | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 150, damping: 20 });
  const py = useSpring(my, { stiffness: 150, damping: 20 });

  return (
    <div
      className="relative"
      onMouseMove={(e) => {
        mx.set(e.clientX + 24);
        my.set(e.clientY - 90);
      }}
    >
      <ol>
        {projects.map((p, i) => (
          <li key={p.slug} className="border-t border-line last:border-b">
            <Link
              href={`/work/${p.slug}`}
              data-cursor-label="view"
              onMouseEnter={() => setActive(p)}
              onMouseLeave={() => setActive(null)}
              className="group relative block overflow-hidden"
            >
              {/* rust fill wipes up on hover */}
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
              />
              <span className="relative grid grid-cols-[3.5rem_1fr] items-baseline gap-x-4 py-7 transition-transform duration-300 group-hover:translate-x-4 md:grid-cols-[4.5rem_1fr_auto]">
                <span className="font-mono text-small text-ink-soft transition-colors duration-200 group-hover:text-[var(--paper)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="font-display block text-[length:var(--text-h2)] font-bold uppercase tracking-tight transition-colors duration-200 group-hover:text-[var(--paper)]">
                    {p.name}
                  </span>
                  <span className="mt-1 block max-w-[60ch] text-ink-soft transition-colors duration-200 group-hover:text-[var(--paper-raised)]">
                    {p.tagline}
                  </span>
                </span>
                <span className="col-start-2 mt-2 font-mono text-micro uppercase tracking-wide text-ink-soft transition-colors duration-200 group-hover:text-[var(--paper-raised)] md:col-start-3 md:mt-0 md:text-right">
                  <span className="block">{p.category}</span>
                  <span className="block">{p.year}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* floating preview placard */}
      {!reduce && (
        <AnimatePresence>
          {active && (
            <motion.div
              key={active.slug}
              className="pointer-events-none fixed left-0 top-0 z-40 hidden w-[300px] overflow-hidden rounded-sm md:block"
              style={{ x: px, y: py }}
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.85, rotate: 4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <div
                className="flex aspect-[16/10] items-center justify-center p-6"
                style={{ backgroundColor: PREVIEW_TINTS[active.slug] ?? "#333" }}
              >
                <div className="text-center">
                  <span className="font-display block text-2xl font-bold uppercase text-[var(--paper)]">
                    {active.name}
                  </span>
                  <span className="mt-2 block font-mono text-micro uppercase tracking-widest text-[var(--paper-raised)]">
                    {active.metrics[0]?.value} {active.metrics[0]?.label}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
