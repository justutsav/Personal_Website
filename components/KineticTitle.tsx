"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Kinetic headline: characters rise in with a stagger on mount, and each
 * one springs up when the pointer passes over it (variable-font weight
 * bump included). Words never break across lines.
 */
export function KineticTitle({
  text,
  className,
  delay = 0,
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  delay?: number;
  /** heading level — one h1 per page, so sections below it pass "h2" */
  as?: "h1" | "h2";
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  let charIndex = 0;

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split("").map((ch) => {
            const i = charIndex++;
            return (
              <motion.span
                key={i}
                aria-hidden
                className="inline-block will-change-transform"
                initial={reduce ? false : { y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: 0.7,
                  delay: delay + i * 0.025,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={
                  reduce
                    ? undefined
                    : {
                        y: "-12%",
                        color: "var(--accent)",
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 12,
                        },
                      }
                }
              >
                {ch}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
