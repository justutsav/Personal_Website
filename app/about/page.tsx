import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { Heatmap } from "@/components/Heatmap";
import { getGithubActivity, getMonkeytypeStats } from "@/lib/activity";

export const metadata: Metadata = {
  title: "About — Utsav",
  description:
    "Independent developer. I build web apps, dashboards, mobile apps and the infrastructure under them.",
};

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
          <Reveal delay={0.1}>
            <h1 className="font-display text-[length:var(--text-h1)] max-w-[20ch]">
              I&apos;m Utsav. I turn &ldquo;we need this&rdquo; into running
              software.
            </h1>
          </Reveal>
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

        {/* ---- Infra stories ---- */}
        <section className="pb-[var(--section-gap)]">
          <Reveal>
            <h2 className="font-mono text-micro uppercase tracking-[0.2em] text-ink-soft mb-10">
              Beyond the browser
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-px bg-line">
            {infra.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="bg-paper h-full py-8 md:pr-8 md:[&:not(:first-child)]:pl-8">
                  <h3 className="font-display text-[length:var(--text-h3)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-small text-ink-soft leading-relaxed">
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

        {/* ---- Elsewhere ---- */}
        <section className="pb-24">
          <Reveal>
            <h2 className="font-mono text-micro uppercase tracking-[0.2em] text-ink-soft mb-8">
              Elsewhere
            </h2>
            <ul className="space-y-3">
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
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-baseline gap-3"
                  >
                    <span className="font-display text-[length:var(--text-h3)] group-hover:text-accent transition-colors duration-200">
                      {l.label}
                    </span>
                    <span className="font-mono text-micro text-ink-soft">
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
