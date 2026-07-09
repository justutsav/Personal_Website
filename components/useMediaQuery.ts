"use client";

import { useEffect, useState } from "react";

/**
 * Client-side media query. Returns false on the server and first paint,
 * then the real match after mount — callers SSR their desktop branch and
 * swap to the mobile presentation post-hydration (no mismatch).
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** Below Tailwind's `md` breakpoint — the scroll-theatre sections swap to
 * their swipe-native mobile presentations here. */
export const MOBILE_QUERY = "(max-width: 767px)";
