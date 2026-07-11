import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { KineticTitle } from "@/components/KineticTitle";
import { Counter } from "@/components/Counter";
import { WorkShowcase } from "@/components/WorkShowcase";
import { Magnetic } from "@/components/Magnetic";
import { HeroExperience } from "@/components/HeroExperience";
import { JourneyTimeline } from "@/components/JourneyTimeline";
import { MusicDisk } from "@/components/MusicDisk";
import { ShowcaseSection } from "@/components/ShowcaseSection";
import { ContactMedia } from "@/components/ContactMedia";
import { ContactDialog } from "@/components/ContactDialog";
import { featuredProjects } from "@/data/projects";
import { publicImageSize } from "@/lib/imageMeta";

const heroStats = [
  { value: 75, prefix: "₹", suffix: "L+", label: "capital managed by my software" },
  { value: 50, suffix: "+", label: "clients using it daily" },
  { value: 23, suffix: "", label: "Play Store releases shipped solo" },
  { value: 3, suffix: "", label: "businesses running on my builds" },
];

export default function Home() {
  // real cover.webp aspect ratios, read at build time — the deck locks each
  // media slot to its image's own aspect so covers render whole everywhere
  const coverAspects = Object.fromEntries(
    featuredProjects.flatMap((p) => {
      const dims = publicImageSize(`projects/${p.slug}/cover.webp`);
      return dims ? [[p.slug, dims.width / dims.height]] : [];
    })
  );

  return (
    <>
      <Nav />
      <MusicDisk />
      <main>
        {/* ---- Hero: scroll-driven experience ---- */}
        <HeroExperience />

        {/* ---- Real businesses: orbiting showcase ---- */}
        <ShowcaseSection />

        {/* ---- Everything below rides over the pinned showcase ---- */}
        <div className="relative z-10">
        {/* ---- Stats: cream foreground slides over the showcase ---- */}
        {/* wall starts pulling right as the 6th card seats (p≈0.72 of the runway) */}
        <section className="bg-panel-ink px-[var(--edge)] py-[var(--section-gap)] text-ink-on-panel shadow-[0_-30px_80px_rgba(0,0,0,0.5)] md:-mt-[140vh]">
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

        {/* ---- Selected work: box you scroll into, then stacked cards ---- */}
        <WorkShowcase projects={featuredProjects} coverAspects={coverAspects} />

        {/* ---- The story: horizontal branching timeline (after the work) ---- */}
        <JourneyTimeline />

        {/* ---- Private-code band: slides up over the held outro screen ---- */}
        <section id="private-band" className="relative z-10 bg-panel-ink px-[var(--edge)] py-[var(--section-gap)] text-ink-on-panel md:-mt-[20vh]">
          {/* centred on mobile, two-column editorial split from md up */}
          <div className="grid gap-10 text-center md:grid-cols-[1fr_1fr] md:text-left">
            <Reveal>
              <h2 className="font-display mx-auto max-w-[16ch] text-[length:var(--text-h1)] font-extrabold uppercase md:mx-0">
                The code is private. The results aren&apos;t.
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="self-end">
                <p className="text-ink-soft-on-panel mx-auto max-w-[52ch] md:mx-0">
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

        {/* ---- Contact: one-screen, text left, media fades in from the right ---- */}
        <section
          id="contact"
          className="flex min-h-[calc(100svh-4rem)] flex-col justify-center bg-paper px-[var(--edge)] py-12"
        >
          <div className="grid items-center gap-10 md:grid-cols-[1.05fr_1fr]">
            <div>
              <Reveal>
                <p className="mb-4 font-mono text-micro uppercase tracking-[0.25em] text-accent">
                  Contact
                </p>
              </Reveal>
              <KineticTitle
                text="HAVE SOMETHING THAT SHOULD EXIST?"
                className="font-display max-w-[13ch] text-[clamp(1.9rem,4vw,3.4rem)] font-extrabold uppercase leading-[1.02]"
              />
              <Reveal delay={0.3}>
                <p className="mt-5 max-w-[42ch] text-small text-ink-soft">
                  Client work — web apps, dashboards, mobile, automation. Tell
                  me what you need; I&apos;ll tell you how I&apos;d build it.
                </p>
              </Reveal>
              <Reveal delay={0.4}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <ContactDialog />
                  <Magnetic>
                    <Link
                      href="/about"
                      data-cursor-label="about"
                      className="inline-block rounded-full border border-ink/25 px-8 py-4 font-mono text-small uppercase tracking-widest text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-[var(--paper)]"
                    >
                      View about me →
                    </Link>
                  </Magnetic>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.2}>
              <div className="h-[38vh] w-full md:h-[62vh]">
                <ContactMedia />
              </div>
            </Reveal>
          </div>
        </section>
        </div>
      </main>
    </>
  );
}
