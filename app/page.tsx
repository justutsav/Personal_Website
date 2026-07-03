import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { KineticTitle } from "@/components/KineticTitle";
import { Counter } from "@/components/Counter";
import { WorkList } from "@/components/WorkList";
import { Magnetic } from "@/components/Magnetic";
import { HeroExperience } from "@/components/HeroExperience";
import { ShowcaseSection } from "@/components/ShowcaseSection";
import { featuredProjects } from "@/data/projects";

const heroStats = [
  { value: 75, prefix: "₹", suffix: "L+", label: "capital managed by my software" },
  { value: 50, suffix: "+", label: "investors using it daily" },
  { value: 23, suffix: "", label: "Play Store releases shipped solo" },
  { value: 3, suffix: "", label: "businesses running on my builds" },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* ---- Hero: scroll-driven experience ---- */}
        <HeroExperience />

        {/* ---- Real businesses: orbiting showcase ---- */}
        <ShowcaseSection />

        {/* ---- Everything below rides over the pinned showcase ---- */}
        <div className="relative z-10">
        {/* ---- Stats: cream foreground slides over the showcase ---- */}
        {/* wall starts pulling right as the 6th card seats (p≈0.72 of the runway) */}
        <section className="-mt-[140vh] bg-panel-ink px-[var(--edge)] py-[var(--section-gap)] text-ink-on-panel shadow-[0_-30px_80px_rgba(0,0,0,0.5)]">
          <Reveal>
            <h2 className="font-display mb-14 max-w-[18ch] text-[length:var(--text-h1)] font-extrabold uppercase">
              The numbers behind the noise
            </h2>
          </Reveal>
          <dl className="grid grid-cols-2 gap-y-12 md:grid-cols-4">
            {heroStats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div>
                  <dd
                    className={`font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold ${
                      i % 2 === 0 ? "text-accent-on-panel" : "text-accent-2-on-panel"
                    }`}
                  >
                    <Counter
                      value={s.value}
                      prefix={s.prefix ?? ""}
                      suffix={s.suffix}
                    />
                  </dd>
                  <dt className="mt-2 max-w-[18ch] text-small text-ink-soft-on-panel">
                    {s.label}
                  </dt>
                </div>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* ---- Selected work ---- */}
        <section id="work" className="bg-paper px-[var(--edge)] py-[var(--section-gap)]">
          <Reveal>
            <div className="mb-12 flex items-baseline justify-between">
              <h2 className="font-display text-[length:var(--text-h1)] font-extrabold uppercase">
                Selected work
              </h2>
              <span className="font-mono text-small text-ink-soft">
                ({featuredProjects.length})
              </span>
            </div>
          </Reveal>
          <WorkList projects={featuredProjects} />
        </section>

        {/* ---- Private-code band: full-bleed dark ---- */}
        <section className="bg-panel-ink px-[var(--edge)] py-[var(--section-gap)] text-ink-on-panel">
          <div className="grid gap-10 md:grid-cols-[1fr_1fr]">
            <Reveal>
              <h2 className="font-display max-w-[16ch] text-[length:var(--text-h1)] font-extrabold uppercase">
                The code is private. The results aren&apos;t.
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="self-end">
                <p className="text-ink-soft-on-panel max-w-[52ch]">
                  Most of my repos run live businesses with real money in them —
                  they can&apos;t be public. So the proof is the kind that
                  matters: numbers, screenshots, and people who use the software
                  every day. Every case study shows the problem, the build, and
                  the outcome.
                </p>
                <p className="mt-6 font-mono text-small text-accent-on-panel">
                  ₹75L+ under management · 50+ daily users · 3 businesses
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---- Contact ---- */}
        <section
          id="contact"
          className="bg-paper px-[var(--edge)] py-[var(--section-gap)]"
        >
          <Reveal>
            <p className="mb-6 font-mono text-micro uppercase tracking-[0.25em] text-accent">
              Contact
            </p>
          </Reveal>
          <KineticTitle
            text="HAVE SOMETHING THAT SHOULD EXIST?"
            className="font-display max-w-[14ch] text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold uppercase"
          />
          <Reveal delay={0.3}>
            <p className="mt-8 max-w-[48ch] text-ink-soft">
              I take on client work — web apps, dashboards, mobile, automation.
              Tell me what you need; I&apos;ll tell you how I&apos;d build it.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <Magnetic className="mt-10">
              <a
                href="mailto:justutsav.05@gmail.com"
                data-cursor-label="email"
                className="inline-block rounded-full bg-accent px-10 py-5 font-mono text-small uppercase tracking-widest text-[var(--paper)] transition-colors duration-300 hover:bg-accent-deep"
              >
                justutsav.05@gmail.com
              </a>
            </Magnetic>
          </Reveal>
        </section>
        </div>
      </main>
    </>
  );
}
