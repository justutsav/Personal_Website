"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Magnetic } from "@/components/Magnetic";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/interests", label: "Interests" },
  { href: "/about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

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
          className="group flex items-center gap-2.5 font-display text-base tracking-tight"
        >
          <Image
            src="/avatar.png"
            alt="Utsav"
            width={26}
            height={26}
            className="rounded-full border border-line"
          />
          <span className="hidden transition-colors duration-200 group-hover:text-accent sm:inline">
            Utsav
          </span>
        </Link>
        <ul className="flex gap-4 sm:gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Magnetic strength={0.5}>
                <Link
                  href={l.href}
                  onClick={(e) => onHashClick(e, l.href)}
                  className="font-mono text-micro uppercase tracking-wide text-ink-soft transition-colors duration-200 hover:text-accent sm:tracking-widest"
                >
                  {l.label}
                </Link>
              </Magnetic>
            </li>
          ))}
        </ul>
      </nav>
    </motion.header>
  );
}
