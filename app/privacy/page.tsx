import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { KineticTitle } from "@/components/KineticTitle";
import { CONTACT_EMAIL } from "@/data/contact";

export const metadata: Metadata = {
  title: "Privacy — Utsav",
  description:
    "What justutsav.com collects: anonymous page-view analytics, no cookies, no accounts, no forms, no ad tech. Written from what the code actually does.",
  alternates: {
    canonical: "/privacy",
    types: { "text/markdown": "/md/privacy" },
  },
};

const UPDATED = "27 August 2026";

/* Keep this page honest: it describes the code in this repo. If a form,
 * a cookie or a third-party script ever lands on the site, update it here
 * in the same commit. */
const sections = [
  {
    title: "The short version",
    body: [
      "This is a personal portfolio. There are no accounts, no sign-ups, no forms and no payments on it. Nothing you do here is used to build a profile of you, and nothing is sold or shared with advertisers.",
      "The only visitor data that exists is anonymous, aggregated page-view counts plus the ordinary server logs any website has.",
    ],
  },
  {
    title: "Analytics",
    body: [
      "The site uses Vercel Web Analytics. It records that a page was viewed — path, referrer, rough country, device type — without cookies and without an identifier that follows you between sites or sessions. I see counts, not people.",
      "There is no Google Analytics, no advertising pixel, no session recorder and no heatmap tool on this site.",
    ],
  },
  {
    title: "Hosting and server logs",
    body: [
      "The site is hosted on Vercel. Like every web host, its edge network logs requests — IP address, user agent, the URL requested and the time — to serve traffic and to defend against abuse. Those logs are Vercel's, kept on their standard retention, and I don't mine them.",
      "Fonts are compiled into the site at build time and served from this domain, so loading a page does not call Google Fonts or any other third party.",
    ],
  },
  {
    title: "What your browser stores",
    body: [
      "No cookies are set by this site. It uses sessionStorage — cleared the moment you close the tab — for two cosmetic things: which hero clip you're on, and your scroll position when you return from a case study.",
      "Media on the site (video clips, the vinyl-disk audio) is served from this domain. Links out to GitHub, LinkedIn, X, YouTube, Monkeytype or a client's site are ordinary links; once you follow one, that site's own privacy policy applies.",
    ],
  },
  {
    title: "If you email me",
    body: [
      `Writing to ${CONTACT_EMAIL} — or reaching me on LinkedIn, X or Discord — means your message and address sit in that mailbox. I use them to reply and to do the work we agree on, nothing else. No mailing list exists, so there is nothing to unsubscribe from.`,
      "Client project data stays inside the client's own systems. It is not copied onto this site; the case studies publish outcomes and sanitised screenshots, never customer records.",
    ],
  },
  {
    title: "Your choices",
    body: [
      `Ask me anything about this page, or ask for a message to be deleted from my mailbox, at ${CONTACT_EMAIL}. Blocking analytics with a content blocker breaks nothing here — the site works identically without it.`,
      `This page describes what the site does as of ${UPDATED}. If that changes, this page changes with it.`,
    ],
  },
];

export default function Privacy() {
  return (
    <>
      <Nav />
      <main className="px-[var(--edge)]">
        <section className="pt-[10vh] pb-[var(--section-gap)]">
          <Reveal>
            <p className="mb-6 font-mono text-micro uppercase tracking-[0.2em] text-accent">
              Privacy
            </p>
          </Reveal>
          <KineticTitle
            text="No accounts, no cookies, no tracking."
            className="font-display max-w-[16ch] text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase leading-[1.02]"
            delay={0.1}
          />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-[62ch] text-ink-soft">
              Most privacy policies are written by a lawyer for a product that
              collects everything. This one is written from the code in this
              site&apos;s repository, and it is short because the site does very
              little with your data.
            </p>
          </Reveal>
        </section>

        <section className="pb-24">
          <div className="max-w-[70ch] space-y-12">
            {sections.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.05}>
                <div className="border-t border-line pt-6">
                  <h2 className="font-display text-[length:var(--text-h3)] font-bold uppercase leading-tight">
                    {s.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-ink-soft">
                    {s.body.map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal>
              <p className="font-mono text-micro uppercase tracking-[0.2em] text-ink-soft">
                Last updated {UPDATED} · Utsav · India · IST (UTC+5:30)
              </p>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
