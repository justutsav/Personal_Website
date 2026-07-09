"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";

/** Lenis smooth scrolling for the whole document. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    // expose so nav / in-page anchors can drive smooth scrolling
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    let raf: number;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // if we land with a hash (e.g. navigated from another route), scroll to it
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) requestAnimationFrame(() => lenis.scrollTo(el as HTMLElement, { offset: -72 }));
    }

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  return <>{children}</>;
}
