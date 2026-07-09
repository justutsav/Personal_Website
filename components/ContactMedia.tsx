"use client";

import { useState } from "react";

/**
 * Right-side contact media (video or photo, uploaded later) that fades
 * smoothly into the page on its left edge via a gradient mask. Falls back
 * to a soft placeholder until real media lands at /assests/contact.*.
 */
export function ContactMedia() {
  const [state, setState] = useState<"video" | "image" | "placeholder">("video");

  const fade =
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 22%, #000 55%)";

  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl md:aspect-auto md:h-full"
      style={{
        WebkitMaskImage: fade,
        maskImage: fade,
      }}
    >
      {state === "video" && (
        <video
          className="h-full w-full object-cover"
          src="/assests/contact.mp4"
          autoPlay
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
