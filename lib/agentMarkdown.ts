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
Client work — web apps, dashboards, mobile, automation. Tell me what you need and I'll tell you how I'd build it.

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
