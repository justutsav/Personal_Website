"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/**
 * Custom cursor: a small rust dot plus a trailing ring.
 * The ring grows over interactive elements; over elements carrying
 * [data-cursor-label] it becomes a filled badge showing that label.
 * Hidden on touch devices and when reduced motion is preferred.
 */
export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 300, damping: 30 });
  const ringY = useSpring(y, { stiffness: 300, damping: 30 });

  useEffect(() => {
    if (reduce || window.matchMedia("(pointer: coarse)").matches) return;
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
    };
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* dot */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[100] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
        style={{ x, y }}
      />
      {/* ring / badge */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[99] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent"
        style={{ x: ringX, y: ringY }}
        animate={{
          width: label ? 76 : hovering ? 56 : 32,
          height: label ? 76 : hovering ? 56 : 32,
          backgroundColor: label ? "var(--accent)" : "rgba(188, 75, 39, 0)",
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
