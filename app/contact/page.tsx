import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { KineticTitle } from "@/components/KineticTitle";
import { CONTACT_CHANNELS, CONTACT_EMAIL } from "@/data/contact";

export const metadata: Metadata = {
  title: "Contact — Utsav",
  description:
    "Hire Utsav (justutsav) for web apps, dashboards, mobile apps and automation. Email justutsav.05@gmail.com — India, IST (UTC+5:30).",
  alternates: {
    canonical: "/contact",
    types: { "text/markdown": "/md/contact" },
  },
};

const brief = [
  {
    title: "What you want to exist",
    body: "One paragraph is enough. The problem it solves matters more than the feature list — I'd rather understand the job than be handed a spec.",
  },
  {
    title: "Who it is for and how many",
    body: "Ten internal users and ten thousand public ones are different builds. Say which, and whether real money moves through it.",
  },
  {
    title: "Deadline and budget range",
    body: "A range is fine. It tells me whether to propose the whole thing or the smallest version that earns its keep first.",
  },
  {
    title: "Anything already built",
    body: "An existing stack, a designer's files, a spreadsheet the business runs on — send it. Most of my work starts by replacing a spreadsheet.",
  },
];

const fitsWell = [
  "Client portals and dashboards where people check numbers they care about",
  "Internal tools that replace a spreadsheet, a WhatsApp thread or a notebook",
  "Android apps built from a web stack and shipped to the Play Store",
  "Automation and AI tooling — scripts, agents, speech-to-text, local-first setups",
  "The infrastructure under all of it: VPS, deployment, domains, uptime",
];

const fitsBadly = [
  "Design-only work with no build attached — I'm a developer, not a studio",
  "Anything that needs a team of five by next week; I work solo and say so",
  "Projects where nobody can answer what happens if it doesn't ship",
];

export default function Contact() {
  const channels = CONTACT_CHANNELS.filter((c) => c.href);

  return (
    <>
      <Nav />
      <main className="px-[var(--edge)]">
        {/* ---- Intro ---- */}
        <section className="pt-[10vh] pb-[var(--section-gap)]">
          <Reveal>
            <p className="mb-6 font-mono text-micro uppercase tracking-[0.2em] text-accent">
              Contact
            </p>
          </Reveal>
          <KineticTitle
            text="Tell me what you need built."
            className="font-display max-w-[16ch] text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase leading-[1.02]"
            delay={0.1}
          />
          <Reveal delay={0.2}>
            <div className="mt-8 max-w-[62ch] space-y-5 text-ink-soft">
              <p>
                I&apos;m Utsav — an independent developer taking client work in
                web apps, dashboards, mobile apps and automation. I build alone,
                end to end, and I stay until the thing runs in production.
              </p>
              <p>
                Email is the fastest route:{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-accent underline underline-offset-4 transition-colors duration-200 hover:text-accent-deep"
                >
                  {CONTACT_EMAIL}
                </a>
                . I read every enquiry that describes a real project and reply
                within a day or two — with how I&apos;d build it, not a
                brochure. I work from India on IST (UTC+5:30) and have shipped
                for clients whose day starts when mine ends.
              </p>
            </div>
          </Reveal>
        </section>

        {/* ---- What to put in the first message ---- */}
        <section className="pb-[var(--section-gap)]">
          <Reveal>
            <h2 className="mb-10 font-mono text-micro uppercase tracking-[0.2em] text-ink-soft">
              What to put in the first message
            </h2>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {brief.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="group relative h-full overflow-hidden rounded-xl border border-line bg-paper-raised p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent">
                  <span className="font-mono text-micro tracking-widest text-accent-2">
                    0{i + 1}
                  </span>
                  <h3 className="font-display mt-4 text-[length:var(--text-h3)] uppercase leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-small leading-relaxed text-ink-soft">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---- Fit ---- */}
        <section className="pb-[var(--section-gap)]">
          <div className="grid gap-10 md:grid-cols-2">
            <Reveal>
              <div>
                <h2 className="mb-4 font-mono text-micro uppercase tracking-[0.2em] text-accent">
                  Good fit
                </h2>
                <ul className="space-y-3 text-ink-soft">
                  {fitsWell.map((f) => (
                    <li key={f} className="border-t border-line pt-3 text-small">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div>
                <h2 className="mb-4 font-mono text-micro uppercase tracking-[0.2em] text-ink-soft">
                  Bad fit — I&apos;ll say so early
                </h2>
                <ul className="space-y-3 text-ink-soft">
                  {fitsBadly.map((f) => (
                    <li key={f} className="border-t border-line pt-3 text-small">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---- Channels ---- */}
        <section className="pb-24">
          <Reveal>
            <h2 className="mb-8 font-mono text-micro uppercase tracking-[0.2em] text-ink-soft">
              Every way to reach me
            </h2>
            <ul>
              <li className="border-t border-line">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  data-cursor-label="mail"
                  className="group flex items-center justify-between gap-4 py-5 transition-[padding] duration-300 hover:pl-4"
                >
                  <span>
                    <span className="font-display text-[length:var(--text-h2)] font-bold uppercase tracking-tight transition-colors duration-200 group-hover:text-accent">
                      Email
                    </span>
                    <span className="block font-mono text-micro uppercase tracking-widest text-ink-soft">
                      {CONTACT_EMAIL}
                    </span>
                  </span>
                  <span className="font-mono text-small text-ink-soft transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
                    →
                  </span>
                </a>
              </li>
              {channels.map((c) => (
                <li key={c.id} className="border-t border-line last:border-b">
                  <a
                    href={c.href!}
                    target="_blank"
                    rel="noopener noreferrer me"
                    data-cursor-label="open"
                    className="group flex items-center justify-between gap-4 py-5 transition-[padding] duration-300 hover:pl-4"
                  >
                    <span>
                      <span className="font-display text-[length:var(--text-h2)] font-bold uppercase tracking-tight transition-colors duration-200 group-hover:text-accent">
                        {c.label}
                      </span>
                      <span className="block font-mono text-micro uppercase tracking-widest text-ink-soft">
                        {c.handle || " "}
                      </span>
                    </span>
                    <span className="font-mono text-small text-ink-soft transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-[52ch] font-mono text-micro uppercase tracking-[0.2em] text-ink-soft">
              Utsav · independent developer · India · IST (UTC+5:30)
            </p>
          </Reveal>
        </section>
      </main>
    </>
  );
}
