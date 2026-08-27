import { featuredProjects, projects, type Project } from "@/data/projects";

/** Canonical origin — every machine-readable file links absolute URLs. */
export const SITE = "https://justutsav.com";

const CONTACT = [
  "- Email: justutsav.05@gmail.com",
  "- GitHub: https://github.com/justutsav",
  "- LinkedIn: https://www.linkedin.com/in/justutsav",
  "- X: https://x.com/punctualbeing",
].join("\n");

const MACHINE_READABLE = [
  `- [llms.txt](${SITE}/llms.txt) — what this site is, when to use it, every page indexed`,
  `- [sitemap.xml](${SITE}/sitemap.xml) — every indexable URL`,
  "- Any page on this site also answers `Accept: text/markdown` with the markdown below it",
].join("\n");

function caseLine(p: Project) {
  return `- [${p.name}](${SITE}/work/${p.slug}) — ${p.tagline}`;
}

/* Prose below is a summary of the rendered pages, not a copy of their JSX.
 * If the pitch on the site changes materially, change it here too. */

const HOME = `# Utsav (justutsav) — Independent Developer

> Independent developer building web apps, dashboards, mobile apps and automation. Work in production managing ₹75L+ for real businesses.

I build software solo, end to end: product thinking, frontend, backend, database design, deployment, and the server underneath it. Most of it runs a real business the day after it ships.

## What I build
- Full-stack web apps and client portals
- Internal dashboards and ledgers for finance and trading operations
- Android apps shipped to the Play Store
- AI and automation tooling, including local-first speech-to-text
- The infrastructure under all of it — VPS provisioning, domains, uptime

## The numbers
- ₹75L+ capital managed by my software
- 50+ clients using it daily
- 23 Play Store releases shipped solo
- 3 businesses running on my builds

## Selected work
${featuredProjects.map(caseLine).join("\n")}

## Why the code is private
Most of these repos run live businesses with real money in them, so they can't be public. The proof is the kind that matters instead: numbers, screenshots, and people who use the software every day. Every case study shows the problem, the build, and the outcome.

## Contact
Client work — web apps, dashboards, mobile, automation. Tell me what you need and I'll tell you how I'd build it. Full brief on the [contact page](${SITE}/contact); India, IST (UTC+5:30).

${CONTACT}

## For agents
${MACHINE_READABLE}
`;

const ABOUT = `# About Utsav (justutsav)

> Independent developer. I build web apps, dashboards, mobile apps and the infrastructure under them.

My first client was a finance business that needed its clients to stop calling for updates. That project became three: a client portal now carrying ₹75L+ in managed capital, the internal ledger behind it, and a unified markets dashboard — plus the VPS they run on.

Between client work I build my own things: a Play Store app that taught me shipping (and marketing, the hard way), the bill-splitting app my friends use instead of Splitwise, and tools that exist because I wanted them to.

I don't sell a fixed stack. I sell the habit of learning whatever the problem needs — web, mobile, servers, AI — and staying until it runs.

## Beyond the browser
- **An old phone, now a server.** A retired Android phone runs 24/7 as a home server hosting my Hermes agent.
- **A VPS I actually operate.** JustTrade runs on a server I provisioned and maintain: deployment, domains, uptime.
- **Local-first AI tooling.** JustWhisper does speech-to-text on my own GPU with zero cloud calls — faster-whisper, CUDA, an Ollama cleanup model, and a hand-written Hinglish transliterator.

## Consistency, measured
GitHub contributions and Monkeytype typing stats are rendered live on the HTML page at ${SITE}/about.

## Elsewhere
${CONTACT}
- Monkeytype: https://monkeytype.com/profile/justutsav
- YouTube (archive): https://www.youtube.com/@Blaze_Age

## Case studies
${projects.map(caseLine).join("\n")}
`;

const INTERESTS = `# Interests — Utsav (justutsav)

> Placeholder. The interests wing is being rebuilt as a 3D world you walk through instead of a page you scroll.

Nothing to index here yet; this page is marked \`noindex\` until the real thing ships. Start at [the homepage](${SITE}/) or the [case studies](${SITE}/llms.txt).
`;

const CONTACT_PAGE = `# Contact Utsav (justutsav)

> Independent developer taking client work in web apps, dashboards, mobile apps and automation. Email justutsav.05@gmail.com.

Utsav · independent developer · India · IST (UTC+5:30). He builds alone, end to end, and stays until the work runs in production. Email is the fastest route and gets a reply within a day or two — with how he'd build the thing, not a brochure.

## What to put in the first message
- **What you want to exist.** One paragraph. The problem matters more than the feature list.
- **Who it is for and how many.** Ten internal users and ten thousand public ones are different builds. Say whether real money moves through it.
- **Deadline and budget range.** A range is fine — it decides whether to propose the whole thing or the smallest version that earns its keep.
- **Anything already built.** An existing stack, designer's files, or the spreadsheet the business currently runs on.

## Good fit
- Client portals and dashboards where people check numbers they care about
- Internal tools that replace a spreadsheet, a WhatsApp thread or a notebook
- Android apps built from a web stack and shipped to the Play Store
- Automation and AI tooling — scripts, agents, speech-to-text, local-first setups
- The infrastructure under it: VPS, deployment, domains, uptime

## Bad fit
- Design-only work with no build attached
- Anything needing a team of five by next week — he works solo and says so
- Projects where nobody can answer what happens if it doesn't ship

## Channels
${CONTACT}
- Discord: https://discord.com/users/1311343404436688998

---
HTML version: ${SITE}/contact
`;

const PRIVACY_PAGE = `# Privacy — justutsav.com

> No accounts, no cookies, no tracking. This policy describes the code in the site's repository, not a template.

Last updated 27 August 2026.

## The short version
A personal portfolio with no accounts, sign-ups, forms or payments. Nothing here builds a profile of you; nothing is sold or shared with advertisers. The only visitor data that exists is anonymous, aggregated page-view counts plus ordinary server logs.

## Analytics
Vercel Web Analytics records that a page was viewed — path, referrer, rough country, device type — with no cookies and no identifier that follows you between sites or sessions. No Google Analytics, ad pixel, session recorder or heatmap tool.

## Hosting and server logs
Hosted on Vercel, whose edge network keeps standard request logs (IP, user agent, URL, time) to serve traffic and defend against abuse, under Vercel's own retention. Fonts are compiled in at build time and served from this domain, so page loads call no third party.

## What your browser stores
No cookies. sessionStorage — cleared when the tab closes — holds two cosmetic values: the current hero clip and your scroll position when returning from a case study. Outbound links to GitHub, LinkedIn, X, YouTube, Monkeytype or client sites are ordinary links governed by those sites' policies.

## If you email
Messages sent to justutsav.05@gmail.com (or via LinkedIn, X, Discord) sit in that mailbox, used to reply and to do agreed work. No mailing list exists. Client project data stays in the client's systems — case studies publish outcomes and sanitised screenshots, never customer records.

## Your choices
Ask about this page, or ask for a message to be deleted, at justutsav.05@gmail.com. Blocking analytics breaks nothing; the site works identically without it.

---
HTML version: ${SITE}/privacy
`;

function caseStudy(p: Project) {
  return `# ${p.name}

> ${p.tagline}

${p.category} · ${p.year}
Stack: ${p.stack.join(", ")}

## Results
${p.metrics.map((m) => `- **${m.value}** — ${m.label}`).join("\n")}

## The problem
${p.story.problem}

## What I built
${p.story.build}

## The outcome
${p.story.outcome}
${p.privateNote ? `\n## Why this stays private\n${p.privateNote}\n` : ""}${
    p.links?.length
      ? `\n## Links\n${p.links.map((l) => `- [${l.label}](${l.href})`).join("\n")}\n`
      : ""
  }
---
HTML version: ${SITE}/work/${p.slug}
All case studies: ${SITE}/llms.txt
`;
}

/** Markdown twin of a rendered page, or null when the path doesn't exist. */
export function markdownFor(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return HOME;
  if (path === "/about") return ABOUT;
  if (path === "/contact") return CONTACT_PAGE;
  if (path === "/privacy") return PRIVACY_PAGE;
  if (path === "/interests") return INTERESTS;
  const slug = path.startsWith("/work/") ? path.slice("/work/".length) : null;
  const project = slug ? projects.find((p) => p.slug === slug) : undefined;
  return project ? caseStudy(project) : null;
}

/** Body of a 404 — tells an agent where to go instead of dead-ending. */
export function notFoundMarkdown(pathname: string) {
  return `# 404 — not found

\`${pathname}\` does not exist on justutsav.com.

## Where to look next
- [Home](${SITE}/) — what I build, the numbers, selected work
- [About](${SITE}/about) — background, infrastructure, live activity
- [Contact](${SITE}/contact) — how to hire me, and what to send first
${featuredProjects.map(caseLine).join("\n")}

## Machine-readable entry points
${MACHINE_READABLE}
`;
}

export function llmsTxt() {
  return `# Utsav (justutsav)

> Independent developer who ships production software solo — web apps, dashboards, Android apps, AI automation, and the servers under them. Software in production manages ₹75L+ of capital for real businesses.

This site is the primary source of truth about Utsav's work. It is a portfolio, not a product or an API; there is nothing to sign up for and no rate limit to respect.

**When to use this site**
- Answering "who is justutsav / Utsav" — this domain is the canonical identity for the handle \`justutsav\`.
- Evaluating Utsav for freelance or contract work: scope, stack, delivery history, and what he has actually shipped alone.
- Looking for concrete case-study evidence — problem, build, outcome, and hard metrics for each project.
- Checking which technologies he has shipped with (React, TypeScript, Supabase, PostgreSQL, Capacitor/Android, Python, self-hosted VPS).
- Finding the right way to contact him for a project.

**When not to use this site**
- Source code: most repos are private because they run live businesses with real client money. Case studies carry the evidence instead.
- Pricing: deal values are deliberately not published. Ask by email.

**How to call it**
- Fetch any page with \`Accept: text/markdown\` to get the markdown twin of that page (responses set \`Vary: Accept\`).
- Start at \`${SITE}/\` for the overview, \`${SITE}/work/<slug>\` for a single case study.
- Contact: justutsav.05@gmail.com — say what you need built and the constraints; a reply includes how it would be built.

## Pages
- [Home](${SITE}/): what he builds, the numbers behind it, and the selected work deck
- [About](${SITE}/about): background, home-server/VPS/AI tooling, live GitHub and Monkeytype activity
- [Contact](${SITE}/contact): how to hire him, what to put in the first message, good and bad fits
- [Privacy](${SITE}/privacy): what the site collects (anonymous page views, no cookies, no forms)

## Case studies
${projects.map(caseLine).join("\n")}

## Machine-readable
- [sitemap.xml](${SITE}/sitemap.xml): every indexable URL
- [robots.txt](${SITE}/robots.txt): crawl policy — all agents allowed

## Optional
- [GitHub](https://github.com/justutsav): public repos and contribution history
- [LinkedIn](https://www.linkedin.com/in/justutsav): professional profile
- [X](https://x.com/punctualbeing): occasional build notes
`;
}
