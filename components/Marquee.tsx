"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Infinite horizontal marquee. Content is duplicated to loop seamlessly;
 * speed is seconds per full cycle.
 */
export function Marquee({
  items,
  speed = 28,
  className,
}: {
  items: string[];
  speed?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const row = (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-6 pr-6">
          <span>{item}</span>
          <span
            aria-hidden
            className={i % 2 === 0 ? "text-accent" : "text-accent-2"}
          >
            ✦
          </span>
        </span>
      ))}
    </>
  );

  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="flex w-max"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        <div className="flex">{row}</div>
        <div className="flex" aria-hidden>
          {row}
        </div>
      </motion.div>
    </div>
  );
}
