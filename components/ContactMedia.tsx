"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Right-side contact media (video or photo, uploaded later) that fades
 * smoothly into the page on its left edge via a gradient mask. Falls back
 * to a soft placeholder until real media lands at /assests/contact.*.
 */
export function ContactMedia() {
  const [state, setState] = useState<"video" | "image" | "placeholder">("video");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  // Only play while the wrapper is on screen; never play under reduced motion
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || state !== "video") return;
    const observer = new IntersectionObserver(([entry]) => {
      const video = videoRef.current;
      if (!video) return;
      if (entry.isIntersecting) {
        if (!reduceMotion) video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [state, reduceMotion]);

  const fade =
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 22%, #000 55%)";

  return (
    <div
      ref={wrapperRef}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl md:aspect-auto md:h-full"
      style={{
        WebkitMaskImage: fade,
        maskImage: fade,
      }}
    >
      {state === "video" && (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/assests/contact.mp4"
          preload="none"
          loop
          muted
          playsInline
          onError={() => setState("image")}
        />
      )}
      {state === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="h-full w-full object-cover"
          src="/assests/contact.jpg"
          alt=""
          onError={() => setState("placeholder")}
        />
      )}
      {state === "placeholder" && (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            background:
              "radial-gradient(120% 120% at 80% 20%, #2b2b2b 0%, var(--paper) 70%)",
          }}
        >
          <span className="font-mono text-micro uppercase tracking-widest text-ink-soft">
            media coming soon
          </span>
        </div>
      )}
    </div>
  );
}
