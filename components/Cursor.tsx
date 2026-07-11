"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { MOBILE_QUERY, useMediaQuery } from "@/components/useMediaQuery";

/**
 * Custom cursor: a small rust dot plus a trailing ring.
 * The ring grows over interactive elements; over elements carrying
 * [data-cursor-label] it becomes a filled badge showing that label.
 * Hidden on touch devices, mobile-size viewports, and when reduced motion is
 * preferred; fades out after a short idle so it never lingers on screen.
 */
export function Cursor() {
  const reduce = useReducedMotion();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [idle, setIdle] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 300, damping: 30 });
  const ringY = useSpring(y, { stiffness: 300, damping: 30 });

  useEffect(() => {
    if (reduce || isMobile || window.matchMedia("(pointer: coarse)").matches) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as Element).closest(
        "a, button, [data-cursor-label]"
      );
      setHovering(!!el);
      setLabel(el?.getAttribute("data-cursor-label") ?? null);
      // wake on movement, fade back out after a beat of stillness
      setIdle(false);
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIdle(true), 2500);
    };
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      clearTimeout(idleTimer.current);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reduce, isMobile, x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* dot — hidden while the badge label shows so it doesn't block text */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[100] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
        style={{ x, y }}
        animate={{ opacity: label || idle ? 0 : 1, scale: label ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      {/* ring / badge */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[99] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent"
        style={{ x: ringX, y: ringY }}
        animate={{
          width: label ? 76 : hovering ? 56 : 32,
          height: label ? 76 : hovering ? 56 : 32,
          backgroundColor: label ? "var(--accent)" : "rgba(188, 75, 39, 0)",
          opacity: idle ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        {label && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--paper)]">
            {label}
          </span>
        )}
      </motion.div>
    </>
  );
}
