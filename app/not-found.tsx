import Link from "next/link";
import { Nav } from "@/components/Nav";
import { featuredProjects } from "@/data/projects";

/**
 * 404 for humans, with the same recovery map agents get from the markdown
 * twin (`Accept: text/markdown` → proxy.ts → /md/*). Status stays 404.
 */
export default function NotFound() {
  const links = [
    { href: "/", label: "Home", note: "what I build, the numbers, selected work" },
    { href: "/about", label: "About", note: "background, infrastructure, live activity" },
    { href: "/contact", label: "Contact", note: "how to hire me, and what to send first" },
    ...featuredProjects.slice(0, 3).map((p) => ({
      href: `/work/${p.slug}`,
      label: p.name,
      note: p.tagline,
    })),
  ];

  return (
    <>
      <Nav />
      <main className="flex min-h-[calc(100svh-4rem)] flex-col justify-center px-[var(--edge)] py-24">
        <p className="mb-6 font-mono text-micro uppercase tracking-[0.2em] text-accent">
          404 — not found
        </p>
        <h1 className="font-display max-w-[16ch] text-[clamp(2.4rem,7vw,5.5rem)] font-extrabold uppercase leading-[1.0]">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-8 max-w-[52ch] text-ink-soft">
          Nothing lives at that URL. Everything that does is one link away.
        </p>

        <h2 className="mt-12 font-mono text-micro uppercase tracking-[0.2em] text-ink-soft">
          Where to look next
        </h2>
        <ul className="mt-4 max-w-[64ch]">
          {links.map((l) => (
            <li key={l.href} className="border-t border-line last:border-b">
              <Link
                href={l.href}
                data-cursor-label="open"
                className="group flex items-baseline justify-between gap-6 py-4 transition-[padding] duration-300 hover:pl-3"
              >
                <span>
                  <span className="font-display text-[length:var(--text-h3)] font-bold uppercase leading-tight transition-colors duration-200 group-hover:text-accent">
                    {l.label}
                  </span>
                  <span className="block max-w-[46ch] text-small text-ink-soft">
                    {l.note}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-small text-ink-soft transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 font-mono text-micro uppercase tracking-[0.2em] text-ink-soft">
          Machine-readable entry points
        </h2>
        {/* plain markdown, on purpose: an agent that lands here can read the
            recovery map straight out of the 404 body */}
        <pre className="mt-4 max-w-[64ch] overflow-x-auto whitespace-pre-wrap font-mono text-small leading-relaxed text-ink-soft">
{`- [llms.txt](https://justutsav.com/llms.txt) — what this site is, when to use it, every page indexed
- [sitemap.xml](https://justutsav.com/sitemap.xml) — every indexable URL
- Any page also answers \`Accept: text/markdown\` with its markdown twin`}
        </pre>
      </main>
    </>
  );
}
