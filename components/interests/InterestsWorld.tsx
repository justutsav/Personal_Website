"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Heatmap } from "@/components/Heatmap";
import type { MonkeytypeStats } from "@/lib/activity";
import { STATIONS } from "@/components/interests/worldData";

/** three + rapier live in their own chunk; only desktop visitors that press
 * ENTER ever download them */
const WorldScene = dynamic(() => import("@/components/interests/WorldScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center font-mono text-micro uppercase tracking-[0.3em] text-ink-soft">
      building the world…
    </div>
  ),
});

/* ---------- mobile / weak-device gate ---------- */

function Gate({ monkeytype }: { monkeytype: MonkeytypeStats | null }) {
  return (
    <div className="px-[var(--edge)] pt-[12vh] pb-24">
      <p className="mb-6 font-mono text-micro uppercase tracking-[0.2em] text-accent">
        Off the clock
      </p>
      <h1 className="font-display max-w-[14ch] text-[clamp(2.2rem,8vw,4.5rem)] font-extrabold uppercase leading-[1.02]">
        This wing is a 3D world.
      </h1>
      <div className="mt-8 max-w-[52ch] rounded-xl border border-line bg-paper-raised p-6">
        <p className="font-mono text-micro uppercase tracking-[0.25em] text-accent-2">
          heavy gpu work inside
        </p>
        <p className="mt-3 text-small leading-relaxed text-ink-soft">
          The interests wing runs a real-time physics world — a character, a
          neon arena, things to kick around. Phones aren&apos;t invited to that
          party. Kindly open this page on a desktop; it&apos;s worth the trip.
        </p>
      </div>

      {/* still give mobile the receipts */}
      {monkeytype && (
        <div className="mt-14">
          <h2 className="mb-2 font-mono text-micro uppercase tracking-[0.2em] text-accent">
            Meanwhile — the sport, measured
          </h2>
          <p className="mb-8 max-w-[52ch] text-small text-ink-soft">
            The typing habit leaves a trail. Live from Monkeytype:
          </p>
          {monkeytype.activity && (
            <Heatmap days={monkeytype.activity} label="typing tests — last 12 months" />
          )}
          <dl className="mt-6 grid grid-cols-2 gap-y-6 md:grid-cols-4">
            {[
              { value: monkeytype.completedTests.toLocaleString(), label: "tests completed" },
              { value: `${monkeytype.hoursTyping}h`, label: "time typing" },
              ...(monkeytype.bestWpm15
                ? [{ value: `${monkeytype.bestWpm15}`, label: "best WPM (15s)" }]
                : []),
              { value: `${monkeytype.maxStreak} days`, label: "longest streak" },
            ].map((s) => (
              <div key={s.label}>
                <dd className="font-display text-[length:var(--text-h2)] text-accent">
                  {s.value}
                </dd>
                <dt className="mt-1 text-small text-ink-soft">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

/* ---------- station panel (DOM, right side) ---------- */

function StationPanel({
  stationId,
  monkeytype,
  onClose,
}: {
  stationId: string;
  monkeytype: MonkeytypeStats | null;
  onClose: () => void;
}) {
  const station = STATIONS.find((s) => s.id === stationId);
  if (!station) return null;
  return (
    <motion.aside
      className="absolute right-0 top-0 z-20 flex h-full w-[min(30rem,92vw)] flex-col overflow-y-auto border-l border-line bg-paper-raised/95 p-8 backdrop-blur-md"
      initial={{ x: "104%" }}
      animate={{ x: 0 }}
      exit={{ x: "104%" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        onClick={onClose}
        data-cursor-label="close"
        className="self-end font-mono text-small uppercase tracking-widest text-ink-soft transition-colors hover:text-ink"
      >
        esc ✕
      </button>
      <span
        className="mt-4 font-mono text-micro uppercase tracking-[0.25em]"
        style={{ color: station.color }}
      >
        {station.tag}
      </span>
      <h2 className="font-display mt-3 text-3xl font-extrabold uppercase leading-tight">
        {station.title}
      </h2>
      <p className="mt-4 text-small leading-relaxed text-ink-soft">{station.body}</p>
      {station.link && (
        <a
          href={station.link.href}
          target={station.link.href.startsWith("/") ? undefined : "_blank"}
          rel={station.link.href.startsWith("/") ? undefined : "noopener noreferrer"}
          data-cursor-label="open"
          className="mt-5 inline-block font-mono text-micro uppercase tracking-widest text-accent transition-colors hover:text-accent-deep"
        >
          {station.link.label} ↗
        </a>
      )}

      {/* live typing proof inside the typing station */}
      {station.id === "typing" && monkeytype && (
        <div className="mt-8 border-t border-line pt-6">
          {monkeytype.activity && (
            <Heatmap days={monkeytype.activity} label="typing tests — last 12 months" />
          )}
          <dl className="mt-5 grid grid-cols-2 gap-y-5">
            {[
              { value: monkeytype.completedTests.toLocaleString(), label: "tests completed" },
              { value: `${monkeytype.hoursTyping}h`, label: "time typing" },
              ...(monkeytype.bestWpm15
                ? [{ value: `${monkeytype.bestWpm15}`, label: "best WPM (15s)" }]
                : []),
              { value: `${monkeytype.maxStreak} days`, label: "longest streak" },
            ].map((s) => (
              <div key={s.label}>
                <dd className="font-display text-2xl text-accent-2">{s.value}</dd>
                <dt className="mt-1 text-micro text-ink-soft">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      )}
    </motion.aside>
  );
}

/* ---------- world shell ---------- */

export function InterestsWorld({ monkeytype }: { monkeytype: MonkeytypeStats | null }) {
  // null = still deciding (avoids gate/world flash on either side)
  const [desktop, setDesktop] = useState<boolean | null>(null);
  const [entered, setEntered] = useState(false);
  const [near, setNear] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    let gl = false;
    try {
      const c = document.createElement("canvas");
      gl = !!(c.getContext("webgl2") ?? c.getContext("webgl"));
    } catch {
      gl = false;
    }
    setDesktop(fine && wide && gl);
  }, []);

  // world hotkeys: E inspects the armed station, ESC closes the panel
  useEffect(() => {
    if (!entered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && near && !open) setOpen(near);
      if (e.code === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entered, near, open]);

  const onNearChange = useCallback((id: string | null) => setNear(id), []);

  if (desktop === null) return <div className="h-[100svh]" />;
  if (!desktop) return <Gate monkeytype={monkeytype} />;

  const nearStation = near ? STATIONS.find((s) => s.id === near) : null;

  return (
    <div className="relative h-[100svh] overflow-hidden">
      {entered && <WorldScene frozen={open !== null} onNearChange={onNearChange} />}

      {/* enter screen — the world (and its chunk) only spins up on commit */}
      <AnimatePresence>
        {!entered && (
          <motion.div
            className="absolute inset-0 z-30 grid place-items-center bg-paper"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <p className="font-mono text-micro uppercase tracking-[0.25em] text-accent">
                Off the clock
              </p>
              <h1 className="font-display mt-4 text-[clamp(2.4rem,6vw,5rem)] font-extrabold uppercase leading-none">
                The interests wing
              </h1>
              <p className="mx-auto mt-4 max-w-[44ch] text-small text-ink-soft">
                A small world of the things that fill the tank. Run around,
                kick the cubes, walk up to a light and press E.
              </p>
              <div className="mt-8 flex items-center justify-center gap-6 font-mono text-micro uppercase tracking-widest text-ink-soft">
                <span>WASD / arrows — move</span>
                <span>shift — run</span>
                <span>space — jump</span>
                <span>E — inspect</span>
              </div>
              <button
                onClick={() => setEntered(true)}
                data-cursor-label="enter"
                className="mt-10 rounded-full bg-accent px-10 py-4 font-mono text-small uppercase tracking-widest text-[var(--paper)] transition-colors duration-300 hover:bg-accent-deep"
              >
                Enter the world
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* prompt when a station is armed */}
      <AnimatePresence>
        {entered && nearStation && !open && (
          <motion.p
            key={nearStation.id}
            className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 rounded-full border border-line bg-paper/80 px-6 py-3 font-mono text-micro uppercase tracking-widest backdrop-blur-sm"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span style={{ color: nearStation.color }}>[E]</span> inspect —{" "}
            {nearStation.title}
          </motion.p>
        )}
      </AnimatePresence>

      {/* controls reminder, bottom-left */}
      {entered && (
        <p className="absolute bottom-4 left-4 z-10 font-mono text-[0.6rem] uppercase tracking-widest text-ink-soft/60">
          wasd move · shift run · space jump · e inspect · esc close
        </p>
      )}

      <AnimatePresence>
        {open && (
          <StationPanel stationId={open} monkeytype={monkeytype} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
