import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { featuredProjects } from "@/data/projects";

const heroStats = [
  { value: "₹75L+", label: "capital managed by my software" },
  { value: "50+", label: "investors using it daily" },
  { value: "23", label: "Play Store releases shipped solo" },
  { value: "3", label: "businesses running on my builds" },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="px-[var(--edge)]">
        {/* ---- Hero ---- */}
        <section className="pt-[14vh] pb-[var(--section-gap)]">
          <Reveal>
            <p className="font-mono text-micro uppercase tracking-[0.2em] text-accent mb-6">
              Independent developer · India
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-[length:var(--text-display)] max-w-[14ch]">
              I build software people actually&nbsp;use.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-[52ch] text-ink-soft">
              Web apps, dashboards, mobile apps, and the servers under them —
              designed, built and kept running for real businesses. Not demos.
              Not portfolios of tutorials. Systems with money and users on the
              line.
            </p>
          </Reveal>

          {/* Stats strip */}
          <Reveal delay={0.35}>
            <dl className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-y-8 border-y border-line py-8">
              {heroStats.map((s) => (
                <div key={s.label}>
                  <dd className="font-display text-[length:var(--text-h2)] text-accent">
                    {s.value}
                  </dd>
                  <dt className="mt-1 text-small text-ink-soft max-w-[18ch]">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        {/* ---- Selected work ---- */}
        <section id="work" className="pb-[var(--section-gap)]">
          <Reveal>
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="font-mono text-micro uppercase tracking-[0.2em] text-ink-soft">
                Selected work
              </h2>
              <span className="font-mono text-micro text-ink-soft">
                ({featuredProjects.length})
              </span>
            </div>
          </Reveal>

          <ol>
            {featuredProjects.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.05}>
                <li className="group border-t border-line last:border-b">
                  <Link
                    href={`/work/${p.slug}`}
                    className="grid grid-cols-[3rem_1fr] md:grid-cols-[4rem_1fr_auto] items-baseline gap-x-4 py-8 transition-colors duration-200"
                  >
                    <span className="font-mono text-small text-ink-soft">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-[length:var(--text-h2)] group-hover:text-accent transition-colors duration-200">
                        {p.name}
                      </h3>
                      <p className="mt-2 max-w-[60ch] text-ink-soft">
                        {p.tagline}
                      </p>
                    </div>
                    <div className="col-start-2 md:col-start-3 mt-3 md:mt-0 font-mono text-micro uppercase tracking-wide text-ink-soft text-left md:text-right">
                      <div>{p.category}</div>
                      <div>{p.year}</div>
                    </div>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* ---- Honest-proof note ---- */}
        <section className="pb-[var(--section-gap)]">
          <Reveal>
            <div className="bg-paper-raised rounded-sm px-8 py-10 md:px-12 max-w-[75ch]">
              <p className="font-display text-[length:var(--text-h3)] italic">
                Most of this code is private — it runs live businesses with
                real money in them.
              </p>
              <p className="mt-4 text-ink-soft">
                So the proof here is the kind that matters: numbers, screenshots,
                and the people who use the software every day. Case studies show
                the problem, the build, and the outcome for each project.
              </p>
            </div>
          </Reveal>
        </section>

        {/* ---- Contact CTA ---- */}
        <section id="contact" className="pb-24">
          <Reveal>
            <div className="border-t border-line-strong pt-16">
              <h2 className="font-display text-[length:var(--text-h1)] max-w-[18ch]">
                Have something that should exist?
              </h2>
              <p className="mt-6 text-ink-soft max-w-[48ch]">
                I take on client work — web apps, dashboards, mobile, automation.
                Tell me what you need; I&apos;ll tell you how I&apos;d build it.
              </p>
              <a
                href="mailto:justutsav.05@gmail.com"
                className="inline-block mt-8 font-mono text-body text-accent hover:text-accent-deep transition-colors duration-200 underline underline-offset-8 decoration-line-strong hover:decoration-accent-deep"
              >
                justutsav.05@gmail.com
              </a>
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}
