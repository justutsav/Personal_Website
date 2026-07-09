import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { KineticTitle } from "@/components/KineticTitle";
import { Heatmap } from "@/components/Heatmap";
import { getGithubActivity, getMonkeytypeStats } from "@/lib/activity";

export const metadata: Metadata = {
  title: "About — Utsav",
  description:
    "Independent developer. I build web apps, dashboards, mobile apps and the infrastructure under them.",
};

type CreditItem = { title: string; by: string; href?: string; note?: string };
const credits: { group: string; items: CreditItem[] }[] = [
  {
    group: "The clips",
    items: [
      {
        title: "“:)”",
        by: "piot",
        href: "https://youtu.be/M5VXCixTdEg",
      },
      {
        title: "Daredevil ft. Write This Down",
        by: "LOREBOUND",
        href: "https://youtu.be/RLJ7NnJ7Rpo",
      },
      {
        title: "This is Minecraft (Distant Horizons 2.0)",
        by: "Memonic",
        href: "https://youtu.be/UtTOK15RBrk",
      },
      {
        title: "Two hero clips + the contact loop",
        by: "creators unknown",
        note: "If one of these is yours, email me — I'll credit it properly or take it down.",
      },
    ],
  },
  {
    group: "The music",
    items: [
      {
        title: "Feel It Still",
        by: "Portugal. The Man",
        href: "https://www.youtube.com/watch?v=pBkHHoOIIn8",
      },
      {
        title: "End of Beginning",
        by: "Djo",
        href: "https://www.youtube.com/watch?v=xy3AcmW0lrQ",
      },
      {
        title: "Slipping Through My Fingers",
        by: "ABBA",
        href: "https://music.youtube.com/watch?v=hRr7qRb-7k4",
      },
    ],
  },
];

const infra = [
  {
    title: "An old phone, now a server",
    body: "A retired Android phone runs 24/7 as a home server, hosting my Hermes agent. Hardware nobody wanted, doing real work — my favourite kind of engineering.",
  },
  {
    title: "A VPS I actually operate",
    body: "JustTrade doesn't just have my code in it — it runs on a VPS I provisioned and maintain: deployment, domains, uptime. I ship the server, not just the site.",
  },
  {
    title: "Local-first AI tooling",
    body: "JustWhisper runs speech-to-text on my own GPU with zero cloud calls — faster-whisper, CUDA, an Ollama cleanup model, and a hand-written Hinglish transliterator.",
  },
];

export default async function About() {
  const [github, monkeytype] = await Promise.all([
    getGithubActivity(),
    getMonkeytypeStats(),
  ]);

  return (
    <>
      <Nav />
      <main className="px-[var(--edge)]">
        {/* ---- Intro ---- */}
        <section className="pt-[10vh] pb-[var(--section-gap)]">
          <Reveal>
            <p className="font-mono text-micro uppercase tracking-[0.2em] text-accent mb-6">
              About
            </p>
          </Reveal>
          <KineticTitle
            text="I turn “we need this” into running software."
            className="font-display max-w-[16ch] text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase leading-[1.02]"
            delay={0.1}
          />
          <Reveal delay={0.2}>
            <div className="mt-8 max-w-[62ch] space-y-5 text-ink-soft">
              <p>
                My first client was a trading business that needed its investors
                to stop calling for updates. That project became three: an
                investor portal now carrying ₹75L+ in capital, the internal
                ledger behind it, and a unified trading dashboard — plus the VPS
                they run on.
              </p>
              <p>
                Between client work I build my own things: a Play Store app
                that taught me shipping (and marketing, the hard way), the
                bill-splitting app my friends use instead of Splitwise, and
                tools that exist because I wanted them to.
              </p>
              <p>
                I don&apos;t sell a fixed stack. I sell the habit of learning
                whatever the problem needs — web, mobile, servers, AI — and
                staying until it runs.
              </p>
            </div>
          </Reveal>
        </section>

        {/* ---- Pull quote ---- */}
        <section className="pb-[var(--section-gap)]">
          <Reveal>
            <p className="font-display max-w-[20ch] text-[clamp(2rem,7vw,5.5rem)] font-extrabold uppercase leading-[0.95]">
              If it should <span className="text-accent">exist</span>, I build it{" "}
              <span className="text-accent-2">that week.</span>
            </p>
          </Reveal>
        </section>

        {/* ---- Infra stories ---- */}
        <section className="pb-[var(--section-gap)]">
          <Reveal>
            <h2 className="font-mono text-micro uppercase tracking-[0.2em] text-ink-soft mb-10">
              Beyond the browser
            </h2>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {infra.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="group relative h-full overflow-hidden rounded-xl border border-line bg-paper-raised p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent">
                  {/* scanline texture, brightens on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-80"
                    style={{
                      background:
                        "repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px)",
                    }}
                  />
                  <span className="relative font-mono text-micro tracking-widest text-accent-2">
                    0{i + 1}
                  </span>
                  <h3 className="font-display relative mt-4 text-[length:var(--text-h3)] uppercase leading-tight">
                    {item.title}
                  </h3>
                  <p className="relative mt-3 text-small leading-relaxed text-ink-soft">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---- Consistency: dark panel ---- */}
        <section className="pb-[var(--section-gap)]">
          <Reveal>
            <div className="bg-panel-ink text-ink-on-panel rounded-sm px-8 py-12 md:px-12">
              <h2 className="font-mono text-micro uppercase tracking-[0.2em] text-accent-on-panel mb-2">
                Consistency, measured
              </h2>
              <p className="text-ink-soft-on-panel max-w-[52ch] mb-10">
                Two things I do almost every day: make things, and type fast.
                Both leave a trail.
              </p>

              {github && (
                <div className="mb-12">
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="font-display text-[length:var(--text-h3)]">
                      GitHub
                    </h3>
                    <span className="font-mono text-small text-accent-on-panel">
                      {github.total.toLocaleString()} contributions / year
                    </span>
                  </div>
                  <Heatmap
                    days={github.days}
                    label="github.com/justutsav — last 12 months"
                  />
                </div>
              )}

              {monkeytype && (
                <div>
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="font-display text-[length:var(--text-h3)]">
                      Monkeytype
                    </h3>
                    <span className="font-mono text-small text-accent-on-panel">
                      @justutsav
                    </span>
                  </div>
                  {monkeytype.activity ? (
                    <Heatmap
                      days={monkeytype.activity}
                      label="typing tests — last 12 months"
                    />
                  ) : null}
                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-y-6 mt-6">
                    {[
                      {
                        value: monkeytype.completedTests.toLocaleString(),
                        label: "tests completed",
                      },
                      {
                        value: `${monkeytype.hoursTyping}h`,
                        label: "time typing",
                      },
                      ...(monkeytype.bestWpm15
                        ? [
                            {
                              value: `${monkeytype.bestWpm15}`,
                              label: "best WPM (15s)",
                            },
                          ]
                        : []),
                      {
                        value: `${monkeytype.maxStreak} days`,
                        label: "longest streak",
                      },
                    ].map((s) => (
                      <div key={s.label}>
                        <dd className="font-display text-[length:var(--text-h2)] text-accent-on-panel">
                          {s.value}
                        </dd>
                        <dt className="mt-1 text-small text-ink-soft-on-panel">
                          {s.label}
                        </dt>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </Reveal>
        </section>

        {/* ---- Credits: the art living on this site ---- */}
        <section id="credits" className="pb-[var(--section-gap)]">
          <Reveal>
            <h2 className="font-mono text-micro uppercase tracking-[0.2em] text-ink-soft mb-3">
              Credits — the art on this site
            </h2>
            <p className="max-w-[58ch] text-small text-ink-soft mb-10">
              The hero clips and the vinyl-disk songs are other people&apos;s
              work that I love. Nothing here is licensed or monetised — it
              lives on a personal portfolio purely as taste. One click and
              you&apos;re at the source.
            </p>
          </Reveal>
          <div className="grid gap-10 md:grid-cols-2">
            {credits.map((g, gi) => (
              <Reveal key={g.group} delay={gi * 0.1}>
                <div>
                  <h3 className="font-mono text-micro uppercase tracking-[0.25em] text-accent-2 mb-2">
                    {g.group}
                  </h3>
                  <ul>
                    {g.items.map((item) => (
                      <li key={item.title} className="border-t border-line last:border-b">
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor-label="open"
                            className="group flex items-center justify-between gap-4 py-4 transition-[padding] duration-300 hover:pl-3"
                          >
                            <span>
                              <span className="font-display text-[length:var(--text-h3)] font-bold uppercase leading-tight transition-colors duration-200 group-hover:text-accent">
                                {item.title}
                              </span>
                              <span className="block font-mono text-micro uppercase tracking-widest text-ink-soft">
                                {item.by}
                              </span>
                            </span>
                            <span className="shrink-0 font-mono text-small text-ink-soft transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent">
                              ↗
                            </span>
                          </a>
                        ) : (
                          <div className="py-4">
                            <span className="font-display text-[length:var(--text-h3)] font-bold uppercase leading-tight text-ink-soft">
                              {item.title}
                            </span>
                            <span className="block font-mono text-micro uppercase tracking-widest text-ink-soft">
                              {item.by}
                            </span>
                            {item.note && (
                              <span className="mt-1 block text-small text-ink-soft">
                                {item.note}
                              </span>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---- Elsewhere ---- */}
        <section className="pb-24">
          <Reveal>
            <h2 className="font-mono text-micro uppercase tracking-[0.2em] text-ink-soft mb-8">
              Elsewhere
            </h2>
            <ul>
              {[
                { label: "GitHub", href: "https://github.com/justutsav" },
                {
                  label: "Monkeytype",
                  href: "https://monkeytype.com/profile/justutsav",
                },
                {
                  label: "YouTube (archive)",
                  href: "https://www.youtube.com/@Blaze_Age",
                },
                {
                  label: "Email",
                  href: "mailto:justutsav.05@gmail.com",
                },
              ].map((l) => (
                <li key={l.label} className="border-t border-line last:border-b">
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-label="open"
                    className="group flex items-center justify-between py-5 transition-[padding] duration-300 hover:pl-4"
                  >
                    <span className="font-display text-[length:var(--text-h2)] font-bold uppercase tracking-tight transition-colors duration-200 group-hover:text-accent">
                      {l.label}
                    </span>
                    <span className="font-mono text-small text-ink-soft transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      </main>
    </>
  );
}
