import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { KineticTitle } from "@/components/KineticTitle";

export const metadata: Metadata = {
  title: "Interests — Utsav",
  description: "The interests wing is being rebuilt as something bigger. Coming soon.",
  alternates: { canonical: "/interests" },
  // placeholder page — keep it out of search until the real wing ships
  robots: { index: false, follow: true },
};

/**
 * Placeholder while the real interests wing (a desktop 3D world) is built on
 * a side branch — see docs/interests-world-progress.md.
 */
export default function Interests() {
  return (
    <>
      <Nav />
      <main className="flex min-h-[calc(100svh-4rem)] flex-col justify-center px-[var(--edge)]">
        <Reveal>
          <p className="mb-6 font-mono text-micro uppercase tracking-[0.2em] text-accent">
            Off the clock
          </p>
        </Reveal>
        <KineticTitle
          text="Something bigger is being built here."
          className="font-display max-w-[16ch] text-[clamp(2.4rem,7vw,5.5rem)] font-extrabold uppercase leading-[1.0]"
          delay={0.1}
        />
        <Reveal delay={0.25}>
          <p className="mt-8 max-w-[52ch] text-ink-soft">
            The interests wing is getting rebuilt into something you walk
            through, not scroll past. It needs a desktop and a little more
            time in the shop.
          </p>
        </Reveal>
        <Reveal delay={0.35}>
          <p className="mt-4 font-mono text-micro uppercase tracking-[0.25em] text-accent-2">
            coming soon
          </p>
        </Reveal>
        <Reveal delay={0.45}>
          <Link
            href="/"
            data-cursor-label="home"
            className="mt-10 inline-block w-fit rounded-full border border-ink/25 px-8 py-4 font-mono text-small uppercase tracking-widest text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-[var(--paper)]"
          >
            ← Back to the site
          </Link>
        </Reveal>
      </main>
    </>
  );
}
