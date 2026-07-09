"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/** Lenis smooth scrolling for the whole document. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const firstRoute = useRef(true);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    lenisRef.current = lenis;
    // expose so nav / in-page anchors can drive smooth scrolling
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    let raf: number;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // own scroll restoration ourselves — the browser's default would drop the
    // user back onto whatever pinned section (e.g. Selected Work) matched the
    // old scrollY after a reload.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isReload = nav?.type === "reload";
    const hash = window.location.hash;

    if (hash && !isReload) {
      // arrived from another route with a target section — scroll to it
      const el = document.querySelector(hash);
      if (el) requestAnimationFrame(() => lenis.scrollTo(el as HTMLElement, { offset: -72 }));
    } else {
      // fresh load or refresh → start at the top; drop a stale #hash so a later
      // refresh can't resurrect the jump
      lenis.scrollTo(0, { immediate: true });
      if (isReload && hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }

    // late-loading media (images) grow the page after init — recompute so the
    // bottom stays reachable on a direct case-study load too
    const onLoad = () => lenis.resize();
    window.addEventListener("load", onLoad);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  // client-side route change → jump to the top of the new page (Lenis owns the
  // scroll position, so Next's default top-scroll never fires — e.g. hitting
  // "Next" at the bottom of a case study left you at the bottom). Hash targets
  // handle their own scroll, so skip those.
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false; // mount effect already positioned the page
      return;
    }
    const lenis = lenisRef.current;
    if (!lenis) return;

    // Case study "Back" → re-seat the deck at the exact card the user opened
    // from. "work:restore" holds either a pixel scrollY or the sentinel "work"
    // (scroll to the Selected Work section top). Consume once; two passes cover
    // the height settling as the home content mounts.
    let restore: string | null = null;
    try {
      restore = sessionStorage.getItem("work:restore");
      if (restore != null) sessionStorage.removeItem("work:restore");
    } catch {
      /* storage blocked */
    }
    if (restore != null) {
      const apply = () => {
        lenis.resize();
        if (restore === "work") {
          const el = document.getElementById("work");
          if (el) lenis.scrollTo(el as HTMLElement, { offset: -72, immediate: true });
        } else {
          lenis.scrollTo(parseInt(restore as string, 10), { immediate: true });
        }
      };
      requestAnimationFrame(apply);
      const rt = window.setTimeout(apply, 220);
      return () => window.clearTimeout(rt);
    }

    if (!window.location.hash) lenis.scrollTo(0, { immediate: true });
    // the new page's content (images, media) can change height after mount —
    // recompute Lenis's scroll limit so the footer / "Next case" past the
    // gallery stays reachable (otherwise scroll caps at the stale height).
    requestAnimationFrame(() => lenis.resize());
    const t = window.setTimeout(() => lenis.resize(), 350);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return <>{children}</>;
}
