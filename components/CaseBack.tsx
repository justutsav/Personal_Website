"use client";

import { useRouter } from "next/navigation";

/**
 * "Back to work" button for a case study. Universal: it returns the user to the
 * exact deck card they opened this study from — not the browser history and not
 * the previous case study. WorkShowcase stashes window.scrollY under
 * "work:returnY" whenever a deck card is clicked; here we promote that to
 * "work:restore" and let SmoothScroll re-seat the page on the home route. If no
 * origin exists (direct URL visit), fall back to the Selected Work section top.
 */
export function CaseBack() {
  const router = useRouter();

  const onClick = () => {
    let target = "work"; // sentinel → scroll to #work section top
    try {
      const y = sessionStorage.getItem("work:returnY");
      if (y != null) target = y;
      sessionStorage.setItem("work:restore", target);
    } catch {
      /* storage blocked — SmoothScroll falls through to its default */
    }
    router.push("/");
  };

  return (
    <button
      onClick={onClick}
      aria-label="Back to work"
      data-cursor-label="back"
      className="group flex h-9 shrink-0 items-center gap-2 rounded-full border border-line px-4 font-mono text-micro uppercase tracking-[0.2em] text-ink-soft transition-colors duration-200 hover:border-accent hover:text-accent"
    >
      <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
        ←
      </span>
      Back
    </button>
  );
}
