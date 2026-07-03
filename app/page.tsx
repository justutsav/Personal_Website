import dynamic from "next/dynamic";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { KineticTitle } from "@/components/KineticTitle";
import { Marquee } from "@/components/Marquee";
import { Counter } from "@/components/Counter";
import { WorkList } from "@/components/WorkList";
import { Magnetic } from "@/components/Magnetic";
import { featuredProjects } from "@/data/projects";

const Hero3D = dynamic(() => import("@/components/Hero3D"));

const heroStats = [
  { value: 75, prefix: "₹", suffix: "L+", label: "capital managed by my software" },
  { value: 50, suffix: "+", label: "investors using it daily" },
  { value: 23, suffix: "", label: "Play Store releases shipped solo" },
  { value: 3, suffix: "", label: "businesses running on my builds" },
];

const services = [
  "WEB APPS",
  "DASHBOARDS",
  "MOBILE APPS",
  "AUTOMATION",
  "AI TOOLS",
  "SERVERS & INFRA",
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* ---- Hero ---- */}
        <section className="relative min-h-[92vh] overflow-hidden px-[var(--edge)]">
          {/* 3D sculpture — right side, behind type */}
          <div className="absolute inset-y-0 right-[-8vw] w-[60vw] md:right-0 md:w-[46vw]">
            <Hero3D />
          </div>

          <div className="relative pt-[12vh]">
            <Reveal>
              <p className="mb-8 font-mono text-micro uppercase tracking-[0.25em] text-accent">
                Utsav · independent developer · India
              </p>
            </Reveal>
            <KineticTitle
              text="I BUILD SOFTWARE PEOPLE ACTUALLY USE."
              className="font-display max-w-[11ch] text-[length:var(--text-display)] font-extrabold uppercase"
              delay={0.15}
            />
            <Reveal delay={0.7}>
              <p className="mt-10 max-w-[46ch] text-ink-soft">
                Web apps, dashboards, mobile apps, and the servers under them —
                designed, built and kept running for real businesses. Not demos.
                Systems with money and users on the line.
              </p>
            </Reveal>
            <Reveal delay={0.85}>
              <Magnetic className="mt-10">
                <a
                  href="#contact"
                  data-cursor-label="say hi"
                  className="inline-block rounded-full border border-line-strong px-8 py-4 font-mono text-small uppercase tracking-widest transition-colors duration-300 hover:bg-accent hover:text-[var(--paper)] hover:border-accent"
                >
                  Start a project ↓
                </a>
              </Magnetic>
            </Reveal>
          </div>
        </section>

        {/* ---- Services marquee ---- */}
        <Marquee
          items={services}
          className="font-display border-y border-line py-5 text-[clamp(1.5rem,3.5vw,2.75rem)] font-bold uppercase"
        />

        {/* ---- Stats ---- */}
        <section className="px-[var(--edge)] py-[var(--section-gap)]">
          <dl className="grid grid-cols-2 gap-y-12 md:grid-cols-4">
            {heroStats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div>
                  <dd className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold text-accent">
                    <Counter
                      value={s.value}
                      prefix={s.prefix ?? ""}
                      suffix={s.suffix}
                    />
                  </dd>
                  <dt className="mt-2 max-w-[18ch] text-small text-ink-soft">
                    {s.label}
                  </dt>
                </div>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* ---- Selected work ---- */}
        <section id="work" className="px-[var(--edge)] pb-[var(--section-gap)]">
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
          className="px-[var(--edge)] py-[var(--section-gap)]"
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
      </main>
    </>
  );
}
