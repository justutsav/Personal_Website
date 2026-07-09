"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { MOBILE_QUERY, useMediaQuery } from "@/components/useMediaQuery";

/**
 * Horizontal branching timeline. Vertical scroll drives horizontal travel.
 * A modest YEAR + PLACE in the left context box changes as you pass each
 * chapter (with a drifting ghost-year behind). Cards are compact teasers —
 * the story is the star, not the titles — and opening a branch slides a
 * detail panel in from the RIGHT so it's always visible in a horizontal scene.
 */

type Chapter = {
  year: string;
  place: string;
  tag: string;
  title: string;
  body: string;
  side: "up" | "down";
  accent: "coral" | "blue";
  spine?: boolean;
  connector?: string;
  more?: string;
  image?: string;
};

const CHAPTERS: Chapter[] = [
  {
    year: "2018",
    place: "Ranchi",
    tag: "where it starts",
    title: "It starts with a friend",
    body: "Atul and I clicked around 2018 — he ran a YouTube channel, I was posting gaming videos. Same itch to make things.",
    connector: "",
    more: "Years later he'd move from videos to trading and I'd move from videos to building software. But the trust was already there — and honestly, none of the rest of this works without that part.",
    spine: true,
    side: "up",
    accent: "coral",
  },
  {
    year: "2019–23",
    place: "figuring it out",
    tag: "the wandering years",
    title: "Making anything that would stick",
    body: "Reselling, paid surveys (that's how I bought Minecraft), one video-editing client, a dozen small experiments. No plan.",
    connector: "The same restlessness that filled the YouTube channel kept looking for its next shape.",
    more: "None of it became a career. What it built instead was a reflex: if something could exist, I'd try to make it. That reflex is basically my whole job now.",
    spine: true,
    side: "down",
    accent: "coral",
  },
  {
    year: "2024",
    place: "first-year summer",
    tag: "the click",
    title: "Turns out I could build software",
    body: "On a summer break I tried Lovable — describe a thing, get a working site. Useful things didn't need years of runway anymore.",
    connector: "One of those endless experiments finally landed: a tool that matched how I already worked.",
    more: "I was just poking at it on the free tier, but it felt like a door opening. I didn't know real web coding yet — I knew I could make things that actually worked, and that was enough to start.",
    spine: true,
    side: "up",
    accent: "blue",
  },
  {
    year: "Jun 2025",
    place: "for Atul",
    tag: "first real thing",
    title: "A copy button became a portal",
    body: "Atul was managing investors' money on a notebook. I offered a copy tool; a day later he asked, “could investors just log in and see it themselves?”",
    connector: "That new confidence met a real problem — belonging to the person I trusted most.",
    more: "I said yes before I was sure it was possible. Burned a lot of tokens, beat a Lovable bug by juggling several accounts to hold the project together, and delivered around 4 June 2025 at atulfinance.com.",
    spine: true,
    side: "down",
    accent: "blue",
    image: "atul.jpg",
  },
  {
    year: "2025",
    place: "atulfinance.com",
    tag: "it kept growing",
    title: "One site became a back-office",
    body: "A year of upgrades — PDF statements, QoL fixes — plus a private finance system and a dashboard pulling his demat accounts into one view.",
    connector: "The portal earned enough trust that Atul just kept handing me the next problem.",
    more: "His managed capital grew from ₹20L to ₹75L+ across 50+ investors, and somewhere in there I stopped being “his dev” and became more of a partner — we talk strategy and tools now, not just tickets.",
    spine: true,
    side: "up",
    accent: "blue",
  },
  {
    year: "2025",
    place: "a side project",
    tag: "shipped it properly",
    title: "Grit — my first store launch",
    body: "A productivity app, and the place I finally nailed the Capacitor + web stack end to end — 23 releases, live on the Play Store.",
    connector: "Building for Atul taught me the stack; Grit is where I pushed it to a published product.",
    more: "It has subscriptions (RevenueCat) and push (OneSignal), but no marketing muscle behind it, so it never became income. What it gave me was proof I could ship — and something real to put in front of a client.",
    spine: false,
    side: "down",
    accent: "coral",
    image: "grit.jpg",
  },
  {
    year: "2025",
    place: "unfinished",
    tag: "the one I dropped",
    title: "StatusKing — never shipped",
    body: "A reels-style editor: your image composited over a background video. The web + Capacitor setup couldn't carry the video, so I let it go.",
    connector: "Grit made shipping look easy; StatusKing was the reminder that some things fight the setup.",
    more: "I still got a smooth reels feed running on a phone — low-res proxy first, HD on dwell, sliding-window preloading. And I learned why reels are so sticky: a random, variable-ratio reward that keeps you craving the next one.",
    spine: false,
    side: "up",
    accent: "blue",
  },
  {
    year: "2025",
    place: "our flat",
    tag: "built out of need",
    title: "SplitFree — because Splitwise capped me",
    body: "Splitwise limited free expenses and wasn't mine, so I built my own. The five of us in the flat track everything on it, daily.",
    connector: "After a dropped experiment, this one was small, personal, and actually got used.",
    more: "Five of us moved into a flat together this year, and the shared-expense math had to live somewhere. It felt right that the somewhere was an app I made — the most-used thing I've built, by people I actually eat dinner with.",
    spine: false,
    side: "down",
    accent: "coral",
    image: "splitfree.jpg",
  },
  {
    year: "off the clock",
    place: "who I am",
    tag: "off the keyboard",
    title: "Fast typing, old channels, small tools",
    body: "I chase WPM on Monkeytype, still carry roots from that old YouTube channel, and I build little tools the moment something should exist.",
    connector: "Most of these started the way SplitFree did — a small itch I couldn't leave alone.",
    more: "The through-line from the gaming videos to now is just that: if a thing should exist and doesn't, I'll spend the week making it. It's less a work ethic than a habit I can't shake.",
    spine: false,
    side: "up",
    accent: "coral",
  },
  {
    year: "now",
    place: "Bhubaneswar",
    tag: "the business",
    title: "Software as a service",
    body: "3rd year of BTech CSE, running a small SaaS practice. Current client: Advik's Astro AI — an astrologer-chat Android app, powered by AI.",
    connector: "All of it — the trust, the stack, the shipped apps — adds up to work I can do for people who aren't Atul.",
    more: "Under the hood it's OpenRouter models with Supabase and pgvector, so replies stay varied instead of canned. It's still in progress, and I'm actively looking for the next client — the same reflex from the wandering years, just pointed at a business now.",
    spine: true,
    side: "down",
    accent: "blue",
  },
];

const GAP = 520;
const CARD_W = 384;
/** first card starts well right of the left fade + context box so it's
 * readable on entry (was 560 → card edge fell under the 34% fade) */
const PAD_L = 840;
const PAD_R = 440;

const col = (a: Chapter["accent"]) => (a === "coral" ? "var(--accent)" : "var(--accent-2)");

function Node({
  chapter,
  index,
  active,
  onOpen,
}: {
  chapter: Chapter;
  index: number;
  active: boolean;
  onOpen: () => void;
}) {
  const reduce = useReducedMotion();
  const up = chapter.side === "up";
  const c = col(chapter.accent);
  const left = PAD_L + index * GAP;

  return (
    <div className="absolute top-1/2" style={{ left, width: CARD_W, transform: "translateX(-50%)" }}>
      {/* stem */}
      <motion.div
        className="absolute left-1/2 w-px -translate-x-1/2"
        style={{ background: c, height: 52, top: up ? -52 : 0 }}
        initial={reduce ? undefined : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* dot */}
      <motion.span
        className="absolute left-1/2 top-0 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{
          borderColor: c,
          backgroundColor: chapter.spine ? c : "var(--paper)",
          boxShadow: active ? `0 0 0 6px ${c}22` : "none",
        }}
        initial={reduce ? undefined : { scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        animate={active ? { scale: [1, 1.22, 1] } : { scale: 1 }}
        transition={active ? { duration: 1.4, repeat: Infinity } : { type: "spring", stiffness: 320, damping: 16 }}
      />

      {/* compact teaser card */}
      <motion.button
        onClick={onOpen}
        data-cursor-label="read"
        className="group absolute w-full cursor-pointer overflow-hidden rounded-2xl border bg-paper-raised text-left"
        style={{
          borderColor: active ? c : "var(--line)",
          top: up ? -52 - 214 : 52,
          boxShadow: active ? `0 18px 44px ${c}22` : "0 8px 24px rgba(0,0,0,0.28)",
        }}
        initial={reduce ? undefined : { opacity: 0, y: up ? -20 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px -8% 0px -8%" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: up ? -6 : 6, boxShadow: `0 24px 52px ${c}33` }}
      >
        {/* accent top edge + faint tint on hover */}
        <span className="block h-[3px] w-full" style={{ background: c }} />
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(160deg, ${c}14 0%, transparent 46%)` }}
        />

        <div className="relative p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.64rem] uppercase tracking-[0.24em]" style={{ color: c }}>
              {chapter.tag}
            </span>
            <span className="font-mono text-[0.6rem] uppercase tracking-widest text-ink-soft">
              {chapter.year}
            </span>
          </div>

          <h3 className="font-display mt-2.5 text-[1.18rem] font-bold uppercase leading-[1.14]">
            {chapter.title}
          </h3>
          <p className="mt-2.5 line-clamp-3 text-[0.92rem] leading-relaxed text-ink-soft">
            {chapter.body}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
            <span className="inline-flex items-center gap-1.5 font-mono text-[0.64rem] uppercase tracking-widest" style={{ color: c }}>
              read
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
            <span className="font-mono text-[0.6rem] tracking-widest text-ink-soft opacity-50">
              {String(index + 1).padStart(2, "0")}/{String(CHAPTERS.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </motion.button>
    </div>
  );
}

function DetailPanel({ chapter, onClose }: { chapter: Chapter | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {chapter && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[61] flex h-full w-[min(92vw,460px)] flex-col overflow-y-auto border-l border-line-strong bg-paper-raised p-8"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 30 }}
          >
            <button
              onClick={onClose}
              data-cursor-label="close"
              className="ml-auto font-mono text-micro uppercase tracking-widest text-ink-soft hover:text-accent"
            >
              close ✕
            </button>
            <span className="mt-6 font-mono text-micro uppercase tracking-[0.28em]" style={{ color: col(chapter.accent) }}>
              {chapter.year} · {chapter.place}
            </span>
            <h3 className="font-display mt-3 text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold uppercase leading-[1.05]">
              {chapter.title}
            </h3>

            {chapter.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/timeline/${chapter.image}`}
                alt=""
                className="mt-5 aspect-video w-full rounded-lg object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="mt-5 flex aspect-video w-full items-center justify-center rounded-lg bg-[rgba(255,255,255,0.05)] font-mono text-micro uppercase tracking-widest text-ink-soft">
                image slot
              </div>
            )}

            <p className="mt-5 text-body text-ink">{chapter.body}</p>
            {chapter.more && <p className="mt-4 text-small text-ink-soft">{chapter.more}</p>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function JourneyTimeline() {
  const reduce = useReducedMotion();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(1440);
  const [open, setOpen] = useState<number | null>(null);
  const [active, setActive] = useState(0);

  const trackW = PAD_L + (CHAPTERS.length - 1) * GAP + PAD_R;
  const maxX = Math.max(0, trackW - vw);

  useEffect(() => {
    const measure = () => setVw(window.innerWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // branches finish scrolling by ~0.6, so the outro sits a bit PAST the last
  // event (it was appearing too early)
  // branches reveal by ~0.6, then keep drifting left while the screen grows
  const x = useSpring(
    useTransform(scrollYProgress, [0, 0.6, 0.97], [0, -maxX, -maxX - 1400]),
    { stiffness: 120, damping: 28, mass: 0.6 }
  );
  const draw = useTransform(scrollYProgress, [0.04, 0.54], [0, 1]);
  const ghostX = useTransform(scrollYProgress, [0, 0.6, 0.97], [60, -160, -300]);

  // outro screen: after the last branch, grows from ZERO at the right edge to
  // full-bleed, fully opaque. The grow spans all the way to ~0.97 — if it
  // finished early the pinned screen would sit static for the remaining
  // scroll and feel like the page stopped scrolling. The private band
  // (-mt on #private-band) slides in over the last few vh.
  const growScale = useTransform(scrollYProgress, [0.64, 0.97], [0, 1.06]);
  const growRadius = useTransform(scrollYProgress, [0.64, 0.93], [22, 0]);
  // closing text loads in with a left→right wipe (clip) at FULL opacity — never
  // fades, so it stays crisp to the very end
  const textWipe = useTransform(scrollYProgress, [0.72, 0.95], [100, 0]);
  const textClip = useMotionTemplate`inset(0 ${textWipe}% 0 0)`;
  const loadBar = useTransform(scrollYProgress, [0.72, 0.97], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (maxX <= 0) return;
    const pAdj = Math.min(p / 0.6, 1);
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < CHAPTERS.length; i++) {
      const center = Math.min(1, Math.max(0, (PAD_L + i * GAP - vw / 2) / maxX));
      const d = Math.abs(pAdj - center);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best !== active) setActive(best);
  });

  const cur = CHAPTERS[active];
  // taller section → slower scroll (the outro grow/hold felt too fast)
  const heightVh = Math.max(300, Math.round((maxX / 1400) * 150 / 0.6));

  if (reduce) {
    return (
      <section id="journey" className="bg-paper px-[var(--edge)] py-[var(--section-gap)]">
        <p className="mb-6 font-mono text-micro uppercase tracking-[0.3em] text-accent">
          The through-line
        </p>
        <ol className="space-y-8">
          {CHAPTERS.map((c) => (
            <li key={c.title}>
              <span className="font-mono text-micro uppercase tracking-widest text-accent-2">
                {c.year} · {c.place}
              </span>
              <h3 className="font-display text-lg font-bold uppercase">{c.title}</h3>
              <p className="text-small text-ink-soft">{c.body}</p>
              {c.more && <p className="mt-1 text-small text-ink-soft">{c.more}</p>}
            </li>
          ))}
        </ol>
      </section>
    );
  }

  // mobile: horizontal travel + fixed-px card math don't fit a phone —
  // vertical spine with dots instead; tap opens the same detail panel
  if (isMobile) {
    return (
      <section id="journey" className="bg-paper px-[var(--edge)] py-[var(--section-gap)]">
        <p className="mb-10 font-mono text-micro uppercase tracking-[0.3em] text-accent">
          The through-line
        </p>

        <div className="relative pl-7">
          {/* spine */}
          <span
            aria-hidden
            className="absolute bottom-2 left-[7px] top-2 w-px"
            style={{ background: "linear-gradient(to bottom, var(--accent), var(--accent-2))" }}
          />
          <ol className="space-y-8">
            {CHAPTERS.map((c, i) => (
              <li key={c.title} className="relative">
                {/* dot */}
                <span
                  aria-hidden
                  className="absolute left-[-27px] top-1.5 h-[13px] w-[13px] rounded-full border-2"
                  style={{
                    borderColor: col(c.accent),
                    backgroundColor: c.spine ? col(c.accent) : "var(--paper)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="w-full rounded-xl border border-line bg-paper-raised p-4 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.24em]" style={{ color: col(c.accent) }}>
                      {c.tag}
                    </span>
                    <span className="font-mono text-[0.58rem] uppercase tracking-widest text-ink-soft">
                      {c.year}
                    </span>
                  </div>
                  <h3 className="font-display mt-2 text-[0.98rem] font-bold uppercase leading-[1.15]">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-soft">{c.body}</p>
                  <span className="mt-3 inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-widest" style={{ color: col(c.accent) }}>
                    read →
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* closing statement */}
        <div className="mt-14 rounded-xl border-2 border-accent/50 px-6 py-10 text-center" style={{ background: "linear-gradient(120deg, #241d15 0%, #17130d 55%, #14120f 100%)" }}>
          <p className="mb-4 font-mono text-micro uppercase tracking-[0.35em] text-accent">
            and that&apos;s the through-line
          </p>
          <h2 className="font-display mx-auto max-w-[18ch] text-[clamp(1.4rem,6vw,2.2rem)] font-extrabold uppercase leading-[1.02] text-ink-on-panel">
            Real businesses run on <span className="text-accent">my code.</span>
          </h2>
        </div>

        <DetailPanel chapter={open === null ? null : CHAPTERS[open]} onClose={() => setOpen(null)} />
      </section>
    );
  }

  return (
    <section id="journey" ref={sectionRef} className="relative -mt-[35vh] bg-paper" style={{ height: `${heightVh}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* drifting ghost year */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ x: ghostX }}
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={cur.year}
              className="font-display font-extrabold uppercase leading-none text-[color:var(--paper-raised)] opacity-60"
              style={{ fontSize: "34vw" }}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.6 }}
            >
              {cur.year}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* left fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-[34%] bg-gradient-to-r from-paper via-paper/85 to-transparent" />

        {/* left context box: kicker + modest changing YEAR / PLACE */}
        <div className="pointer-events-none absolute left-[var(--edge)] top-[13vh] z-10 max-w-[30vw]">
          <p className="mb-3 font-mono text-micro uppercase tracking-[0.3em] text-accent">
            The through-line
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="font-display text-[clamp(2rem,5vw,4.2rem)] font-extrabold uppercase leading-[0.9]"
                style={{ color: col(cur.accent) }}
              >
                {cur.year}
              </div>
              <div className="mt-1 font-mono text-small uppercase tracking-[0.28em] text-ink-soft">
                {cur.place}
              </div>
              <div className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft opacity-70">
                {cur.tag}
              </div>
            </motion.div>
          </AnimatePresence>
          <p className="mt-6 font-mono text-micro uppercase tracking-widest text-ink-soft">
            scroll → · click a card
          </p>
        </div>

        {/* horizontal track: branches */}
        <motion.div className="absolute top-0 left-0 h-full" style={{ width: trackW, x }}>
          <svg
            className="absolute top-1/2 left-0 -translate-y-1/2 overflow-visible"
            width={trackW}
            height="200"
            viewBox={`0 0 ${trackW} 200`}
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="tl-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="var(--accent)" />
                <stop offset="1" stopColor="var(--accent-2)" />
              </linearGradient>
            </defs>
            <path d={wavyPath(trackW)} stroke="var(--line)" strokeWidth="2" fill="none" />
            <motion.path
              d={wavyPath(trackW)}
              stroke="url(#tl-grad)"
              strokeWidth="3"
              fill="none"
              style={{ pathLength: draw }}
            />
          </svg>

          {CHAPTERS.map((c, i) => (
            <Node key={c.title} chapter={c} index={i} active={active === i} onOpen={() => setOpen(i)} />
          ))}
        </motion.div>

        {/* outro screen — appears at the right edge, grows LEFT to full-bleed,
            opaque, on top of the branches */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden border-2 border-accent/50"
          style={{
            scale: growScale,
            borderRadius: growRadius,
            transformOrigin: "100% 50%",
            zIndex: 40,
            background: "linear-gradient(120deg, #241d15 0%, #17130d 55%, #14120f 100%)",
          }}
        >
          <span
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px)",
            }}
          />

          {/* closing statement — attached to the screen, loads in with a wipe */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-[var(--edge)] text-center">
            <motion.div style={{ clipPath: textClip, WebkitClipPath: textClip }}>
              <p className="mb-6 font-mono text-micro uppercase tracking-[0.35em] text-accent">
                and that&apos;s the through-line
              </p>
              <h2 className="font-display max-w-[18ch] text-[clamp(1.5rem,3.8vw,3.2rem)] font-extrabold uppercase leading-[1.02]">
                Real businesses run on <span className="text-accent">my code.</span>
              </h2>
            </motion.div>
            {/* loading bar under the line */}
            <motion.div
              className="mt-8 h-[3px] w-[min(42vw,440px)] origin-left rounded-full bg-gradient-to-r from-accent to-accent-2"
              style={{ scaleX: loadBar }}
            />
          </div>
        </motion.div>
      </div>

      {/* right-slide detail panel (horizontal open) */}
      <DetailPanel chapter={open === null ? null : CHAPTERS[open]} onClose={() => setOpen(null)} />
    </section>
  );
}

function wavyPath(width: number) {
  const mid = 100;
  const amp = 22;
  const seg = GAP;
  let d = `M 0 ${mid}`;
  for (let xx = 0; xx < width; xx += seg) {
    const cx1 = xx + seg * 0.25;
    const cx2 = xx + seg * 0.75;
    const dir = (xx / seg) % 2 === 0 ? -1 : 1;
    d += ` C ${cx1} ${mid + dir * amp}, ${cx2} ${mid - dir * amp}, ${xx + seg} ${mid}`;
  }
  return d;
}
