import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { KineticTitle } from "@/components/KineticTitle";
import { Heatmap } from "@/components/Heatmap";
import { AnimeLab } from "@/components/AnimeLab";
import { getMonkeytypeStats } from "@/lib/activity";

export const metadata: Metadata = {
  title: "Interests — Utsav",
  description:
    "In the making of greatness: the obsessions off the clock — typing sprints, music, edits, and worlds worth getting lost in.",
};

/**
 * The exploration wing of the site. Deliberately sparse for now — each block
 * is a room that will fill up with uploads over time.
 */
const rooms = [
  {
    no: "01",
    title: "The keyboard is a sport",
    body: "I chase WPM on Monkeytype almost daily. Typing fast isn't about speed for its own sake — it's the closest thing to muscle memory becoming thought.",
    link: { label: "Monkeytype profile", href: "https://monkeytype.com/profile/justutsav" },
  },
  {
    no: "02",
    title: "The soundtrack",
    body: "There's always something playing while I build. The vinyl disk on the home page is a real rotation — the songs I can't stop looping. Full credits live on the About page.",
    link: { label: "Credits", href: "/about#credits" },
  },
  {
    no: "03",
    title: "Frames & edits",
    body: "Before software there was a YouTube channel. I still collect edits that hit — a few of them play in the hero up top. The archive is where all of this started.",
    link: { label: "YouTube (archive)", href: "https://www.youtube.com/@Blaze_Age" },
  },
  {
    no: "04",
    title: "Worlds I get lost in",
    body: "Minecraft with Distant Horizons pushed to the horizon line, and whatever game respects my curiosity. Gaming is where the making-things itch first showed up.",
  },
];

export default async function Interests() {
  const monkeytype = await getMonkeytypeStats();

  return (
    <>
      <Nav />
      <main className="px-[var(--edge)]">
        {/* ---- Opening ---- */}
        <section className="pt-[10vh] pb-[var(--section-gap)]">
          <Reveal>
            <p className="mb-6 font-mono text-micro uppercase tracking-[0.2em] text-accent">
              Off the clock
            </p>
          </Reveal>
          <KineticTitle
            text="In the making of greatness."
            className="font-display max-w-[14ch] text-[clamp(2.4rem,7vw,5.5rem)] font-extrabold uppercase leading-[1.0]"
            delay={0.1}
          />
          <Reveal delay={0.25}>
            <p className="mt-8 max-w-[56ch] text-ink-soft">
              Nobody ships well from an empty tank. These are the obsessions
              that fill mine — the things I do when no client is waiting and no
              deadline is watching. This wing of the site will keep growing;
              consider it under construction, on purpose.
            </p>
          </Reveal>
        </section>

        {/* ---- Rooms ---- */}
        <section className="pb-[var(--section-gap)]">
          <div className="grid gap-4 md:grid-cols-2">
            {rooms.map((room, i) => (
              <Reveal key={room.no} delay={i * 0.08}>
                <div className="group relative h-full overflow-hidden rounded-xl border border-line bg-paper-raised p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-80"
                    style={{
                      background:
                        "repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px)",
                    }}
                  />
                  <span className="relative font-mono text-micro tracking-widest text-accent-2">
                    {room.no}
                  </span>
                  <h2 className="font-display relative mt-4 text-[length:var(--text-h3)] uppercase leading-tight">
                    {room.title}
                  </h2>
                  <p className="relative mt-3 text-small leading-relaxed text-ink-soft">
                    {room.body}
                  </p>
                  {room.link && (
                    <a
                      href={room.link.href}
                      target={room.link.href.startsWith("/") ? undefined : "_blank"}
                      rel={room.link.href.startsWith("/") ? undefined : "noopener noreferrer"}
                      data-cursor-label="open"
                      className="relative mt-5 inline-block font-mono text-micro uppercase tracking-widest text-accent transition-colors duration-200 hover:text-accent-deep"
                    >
                      {room.link.label} ↗
                    </a>
                  )}
                  {/* media slot — uploads land here later */}
                  <div className="relative mt-6 flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed border-line font-mono text-micro uppercase tracking-widest text-ink-soft">
                    uploads landing soon
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---- Live proof: typing ---- */}
        {monkeytype && (
          <section className="pb-24">
            <Reveal>
              <div className="bg-panel-ink text-ink-on-panel rounded-sm px-8 py-12 md:px-12">
                <h2 className="font-mono text-micro uppercase tracking-[0.2em] text-accent-on-panel mb-2">
                  The sport, measured
                </h2>
                <p className="text-ink-soft-on-panel max-w-[52ch] mb-8">
                  The typing habit leaves a trail. Live from Monkeytype:
                </p>
                {monkeytype.activity ? (
                  <Heatmap
                    days={monkeytype.activity}
                    label="typing tests — last 12 months"
                  />
                ) : null}
                <dl className="mt-6 grid grid-cols-2 gap-y-6 md:grid-cols-4">
                  {[
                    {
                      value: monkeytype.completedTests.toLocaleString(),
                      label: "tests completed",
                    },
                    { value: `${monkeytype.hoursTyping}h`, label: "time typing" },
                    ...(monkeytype.bestWpm15
                      ? [{ value: `${monkeytype.bestWpm15}`, label: "best WPM (15s)" }]
                      : []),
                    { value: `${monkeytype.maxStreak} days`, label: "longest streak" },
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
            </Reveal>
          </section>
        )}

        {/* ---- Experimental: anime.js lab ---- */}
        <Reveal>
          <AnimeLab />
        </Reveal>
      </main>
    </>
  );
}
