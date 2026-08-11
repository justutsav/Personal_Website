export type Metric = { value: string; label: string };

export type Project = {
  slug: string;
  name: string;
  /** One-line hook shown in lists */
  tagline: string;
  category: "Client work" | "Product" | "Tool" | "Frontend craft";
  year: string;
  stack: string[];
  /** Featured on the homepage selected-work list */
  featured: boolean;
  /** Orientation of the three small deck shots (phone screenshots vs web) */
  shotOrientation?: "portrait" | "landscape";
  metrics: Metric[];
  /** Case study body: problem → build → outcome */
  story: {
    problem: string;
    build: string;
    outcome: string;
  };
  /** Why the code stays private, shown as a small honest note */
  privateNote?: string;
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "atul-finance",
    name: "Atul Finance",
    tagline: "Client portal for a finance business — 50+ clients track their portfolios here.",
    category: "Client work",
    year: "2025 — ongoing",
    stack: ["React", "TypeScript", "Supabase", "PostgreSQL"],
    featured: true,
    metrics: [
      { value: "₹75L+", label: "capital managed" },
      { value: "50+", label: "active clients" },
      { value: "1st", label: "project shipped" },
    ],
    story: {
      problem:
        "A growing finance business had no way to show its clients how their portfolios were doing. Updates travelled over phone calls and screenshots — no trust layer, no history, no self-service.",
      build:
        "A web portal where every client logs in and sees their own portfolio, returns and full transaction history — while the owner manages everything from an admin side. Built end-to-end: auth, roles, database design, deployment.",
      outcome:
        "In production since 2025. Clients check their numbers themselves instead of calling. The portal now carries the trust of ₹75L+ in managed capital — and it was my first shipped project. The UI has come a long way since v1, and I keep the early screenshots around as proof of the distance travelled.",
    },
    privateNote:
      "Code stays private — it runs a real business with real client data. Screenshots and the numbers speak instead.",
    links: [{ label: "atulfinance.com", href: "https://www.atulfinance.com" }],
  },
  {
    slug: "justtrade",
    name: "JustTrade",
    tagline: "One dashboard for every brokerage account the business runs.",
    category: "Client work",
    year: "2026 — ongoing",
    stack: ["React", "TypeScript", "Supabase", "VPS", "Java"],
    featured: false,
    metrics: [
      { value: "Multi", label: "broker accounts unified" },
      { value: "Daily", label: "driver of the day's decisions" },
      { value: "Self-hosted", label: "on a VPS I run" },
    ],
    story: {
      problem:
        "The business's own market activity ran across several brokerage accounts. Each broker has its own app, its own format — no single view of exposure, P&L or history across all of them.",
      build:
        "A unified trade-tracking system: every trade from every account flows into one place, with dashboards shaped around how the owner actually reads his day. I also set up and run the VPS it lives on — deployment, domains, uptime, all of it.",
      outcome:
        "The owner opens one screen instead of five broker apps. Trade history, account-wise breakdowns and daily P&L in the exact layout he asked for. Infrastructure included — not just the app, the server under it.",
    },
    privateNote:
      "Private for the same reason as Atul Finance: live business data. The dashboard screenshots are sanitised.",
  },
  {
    slug: "justfinance",
    name: "JustFinance",
    tagline: "The internal ledger behind the finance business — money in, money out, analysis in between.",
    category: "Client work",
    year: "2026 — ongoing",
    stack: ["React", "TypeScript", "Supabase", "PostgreSQL"],
    featured: false,
    metrics: [
      { value: "2", label: "daily operators" },
      { value: "100%", label: "of business money flows through it" },
    ],
    story: {
      problem:
        "Money coming in, payouts going out, expenses, and the business's own analysis — all living in spreadsheets and memory. The owner needed the internal side of the business to be as organised as the client-facing side.",
      build:
        "An internal finance-management system covering the flows Atul Finance doesn't show publicly: capital tracking, business analysis, operational records. Designed around how the owner and his employee actually work, not around a generic template.",
      outcome:
        "Used daily by the owner and his employee. It's the quiet system of record behind the two public-facing apps — the kind of software nobody sees and the business can't run without.",
    },
    privateNote:
      "This one can't even be described in full detail publicly — it is the inside of a running business.",
  },
  {
    slug: "grit",
    name: "Grit",
    tagline: "A personal-management app on the Play Store — built, shipped and maintained by one person.",
    category: "Product",
    year: "2025 — 2026",
    stack: ["React", "TypeScript", "Capacitor", "Android", "Supabase"],
    featured: true,
    metrics: [
      { value: "23", label: "Play Store releases" },
      { value: "v1.6", label: "and counting" },
      { value: "1", label: "developer, every layer" },
    ],
    story: {
      problem:
        "I wanted to build and sell my own product — a personal-management app: tasks, streaks, focus timers, the works. Started life inside a group project (a Rubik's-cube app), then I took it solo and rebuilt it into something shippable.",
      build:
        "Everything a small team would ship, alone: native Android packaging with Capacitor, custom theme system, activity streaks, a focus timer ('Mental Reservoir'), deadline pickers, crash reporting with full native debug symbols, edge-to-edge UI fixes, release management across 23 versioned builds with changelogs and release notes.",
      outcome:
        "The honest part: it never made money. The product was real, the marketing wasn't — and that failure taught me more about products than the building did. The engineering trail (23 releases, changelogs, roadmap, crash-free sessions) is exactly what I now bring to client work.",
    },
    links: [
      {
        label: "Play Store",
        href: "https://play.google.com/store/apps/details?id=com.justmanager.app",
      },
    ],
  },
  {
    slug: "splitfree",
    name: "SplitFree",
    tagline: "Splitwise wanted money for basic features. So my friends and I stopped needing Splitwise.",
    category: "Product",
    year: "2026 — ongoing",
    stack: ["React", "TypeScript", "Supabase", "Capacitor"],
    featured: true,
    metrics: [
      { value: "Daily", label: "use in my friend group" },
      { value: "₹0", label: "paywalls, ever" },
    ],
    story: {
      problem:
        "Splitwise put payment-recording — the one feature a bill-splitting app exists for — behind a paywall. My friend group actually needed the tool, and paying rent for arithmetic felt wrong.",
      build:
        "A full bill-splitting app: groups, expenses, settlements, running balances. Built the flows we actually use instead of the ones that demo well.",
      outcome:
        "It replaced Splitwise for my entire friend group — every trip, every dinner, every month of shared expenses runs through it. Software you and your friends use daily is the most honest QA there is.",
    },
  },
  {
    slug: "astro",
    name: "Astro",
    tagline: "Astrology in one app — kundli generation and chat with astrologers. A client build in progress.",
    category: "Client work",
    year: "2026",
    stack: ["React", "TypeScript", "Capacitor", "Android"],
    featured: true,
    metrics: [
      { value: "Client", label: "active engagement" },
      { value: "Android", label: "app platform" },
    ],
    story: {
      problem:
        "A client, Advik, wanted a single place for astrology — where users generate their kundli (birth chart), read it, and chat with astrologers, all in one app.",
      build:
        "Built the full product: kundli generation and presentation, the reading views, and a chat experience for talking with astrologers. It's now in its testing phase, ahead of launch.",
      outcome:
        "In active development as a paid client engagement — a second client relationship, and proof the pattern repeats: someone brings an idea, I build the product.",
    },
    privateNote: "Client owns the product, so the repo stays theirs. It's in testing ahead of launch; the flow is shown with screenshots from the app.",
  },
  {
    slug: "zentry-clone",
    name: "Zentry Clone",
    tagline: "The Awwwards-winning Zentry site, rebuilt frame by frame — my GSAP masterclass.",
    category: "Frontend craft",
    year: "2025",
    stack: ["React", "Vite", "Tailwind CSS", "GSAP"],
    featured: true,
    shotOrientation: "landscape",
    metrics: [
      { value: "GSAP", label: "scroll-driven cinematics" },
      { value: "Live", label: "deployed on Vercel" },
      { value: "100%", label: "responsive recreation" },
    ],
    story: {
      problem:
        "Sites like Zentry win Awwwards because every scroll feels directed, like a film. I wanted that level of motion craft in my own hands — and the only way to earn it was to rebuild one of the best, pixel by pixel.",
      build:
        "A full frontend recreation of the Zentry gaming site: cinematic video hero, scroll-triggered reveals and text animations with GSAP, a bento grid, 3D-style hover interactions — responsive across devices, built with React, Vite and Tailwind.",
      outcome:
        "Deployed and public. The scroll choreography you're feeling on this very portfolio is a direct descendant of what this build taught me — it turned 'how do they even do that?' into a tool I use for clients.",
    },
    links: [
      { label: "Live site", href: "https://zentry-clone-website-mu.vercel.app/" },
      { label: "GitHub", href: "https://github.com/justutsav/Zentry-clone-Website" },
    ],
  },
  {
    slug: "justwhisper",
    name: "JustWhisper",
    tagline: "Hold a key, speak, release — clean text lands in whatever window you're in. Fully offline.",
    category: "Tool",
    year: "2026 — in progress",
    stack: ["Python", "faster-whisper", "CUDA", "Ollama", "X11"],
    featured: false,
    metrics: [
      { value: "0", label: "cloud calls" },
      { value: "2", label: "languages (English + Hinglish)" },
    ],
    story: {
      problem:
        "Voice dictation tools are cloud-bound, app-bound, or both. I wanted Wispr-Flow-style dictation that works in any window on my Linux machine, with nothing leaving the machine.",
      build:
        "Hold right-Alt → mic capture → faster-whisper on CUDA → an Ollama LLM tidies English, while Hindi goes through a deterministic Devanagari→Hinglish transliterator I wrote (rule-based, so words are never mutated) → text is typed into the focused window. Ships with a systemd service.",
      outcome:
        "I dictate into terminals, browsers, editors — anything. Still a work in progress and honest about its limits, but 'मैं ठीक हूँ' coming out as 'main theek hoon', offline, in any app, is already something I use.",
    },
    links: [{ label: "GitHub", href: "https://github.com/justutsav/justWhisper" }],
  },
  {
    slug: "wpm-overlay",
    name: "WPM Overlay",
    tagline: "A live typing-speed overlay — because I like watching the needle move.",
    category: "Tool",
    year: "2025",
    stack: ["Python", "Tkinter", "pynput"],
    featured: false,
    metrics: [
      { value: "Live", label: "WPM graph on screen" },
    ],
    story: {
      problem:
        "I love typing fast (Monkeytype will confirm), and I wanted my live speed visible whatever I'm doing — not just inside a typing-test website.",
      build:
        "A lightweight always-on-top overlay: real-time WPM from global key events, a live graph, colour-coded speed bands.",
      outcome:
        "A small tool, public on GitHub, that says something bigger: when I want a thing to exist, I build it the same week.",
    },
    links: [{ label: "GitHub", href: "https://github.com/justutsav/wpm-overlay" }],
  },
];

/** Homepage deck, in display order. */
const FEATURED_ORDER = [
  "grit",
  "zentry-clone",
  "atul-finance",
  "astro",
  "splitfree",
];

export const featuredProjects = FEATURED_ORDER.map(
  (slug) => projects.find((p) => p.slug === slug)!
).filter(Boolean);
