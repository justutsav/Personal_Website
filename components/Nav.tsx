"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Magnetic } from "@/components/Magnetic";
import { useMusic } from "@/components/MusicProvider";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/interests", label: "Interests" },
  { href: "/about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

/**
 * Sound-bars toggle. Appears once Selected Work has been reached (persists via
 * MusicProvider), then stays in the nav everywhere. Click pauses/resumes the
 * music; the bars freeze when paused.
 */
function MusicToggle() {
  const { reached, active, paused, togglePaused } = useMusic();
  if (!reached) return null;
  return (
    <button
      onClick={togglePaused}
      aria-label={paused ? "Play music" : "Pause music"}
      data-cursor-label={paused ? "play" : "pause"}
      className="flex h-4 items-end gap-[2.5px] text-ink-soft transition-colors hover:text-accent"
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="h-4 w-[3px] rounded-full bg-current"
          style={{ transformOrigin: "bottom" }}
          animate={active ? { scaleY: [0.35, 1, 0.5, 0.85, 0.4] } : { scaleY: 0.3 }}
          transition={
            active
              ? { duration: 0.85 + i * 0.18, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
          }
        />
      ))}
    </button>
  );
}

/**
 * Compact fixed nav: hides when scrolling down, returns on the first
 * scroll up. Blends into the hero (no line, no backdrop) and only gains
 * its hairline + blur once past the first screen.
 */
export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const pathname = usePathname();
  const hasHero = pathname === "/"; // only home opens with the full-screen hero

  // in-page hash links: drive Lenis directly (native anchor jumps don't
  // work while smooth scroll owns the scroll position)
  const onHashClick = (e: React.MouseEvent, href: string) => {
    if (!href.includes("#")) return;
    const hash = "#" + href.split("#")[1];
    if (pathname !== "/") return; // let Link navigate home first; SmoothScroll scrolls on load
    const el = document.querySelector(hash);
    if (!el) return;
    e.preventDefault();
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: Element, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(el, { offset: -72 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY && y > 120); // down → hide (after a little travel)
      lastY = y;
      setPastHero(hasHero ? y > window.innerHeight * 0.85 : y > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasHero]);

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 px-[var(--edge)] transition-colors duration-300 ${
        pastHero
          ? "border-b border-line bg-[rgba(14,13,11,0.75)] backdrop-blur-md"
          : "border-b border-transparent"
      }`}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav className="flex items-center justify-between py-2.5">
        <Link
          href="/"
          // sized to match the nav links (same clamp) — inline because the
          // token/arbitrary text utilities don't emit in this project
          style={{ fontSize: "clamp(0.9rem, 1.4vw, 1.30rem)" }}
          className="group flex items-center gap-2.5 font-display tracking-tight"
        >
          <Image
            src="/avatar.png"
            alt="Utsav"
            width={34}
            height={34}
            style={{ width: "clamp(30px, 2.2vw, 40px)", height: "clamp(30px, 2.2vw, 40px)" }}
            className="rounded-full border border-line"
          />
          <span className="hidden transition-colors duration-200 group-hover:text-accent sm:inline">
            Utsav
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <ul className="flex gap-3 sm:gap-6">
            {links.map((l) => (
              <li key={l.href}>
                <Magnetic strength={0.5}>
                  <Link
                    href={l.href}
                    onClick={(e) => onHashClick(e, l.href)}
                    // inline font-size: this project's Tailwind doesn't emit the
                    // text-micro / text-[Xrem] token utilities, so classes were
                    // no-ops. clamp → smaller on mobile, larger on desktop.
                    style={{ fontSize: "clamp(0.9rem, 1.4vw, 1.30rem)" }}
                    className="font-mono uppercase tracking-wide text-ink-soft transition-colors duration-200 hover:text-accent sm:tracking-widest"
                  >
                    {l.label}
                  </Link>
                </Magnetic>
              </li>
            ))}
          </ul>
          <MusicToggle />
        </div>
      </nav>
    </motion.header>
  );
}
