"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

/**
 * Single source of truth for the portfolio's background music. Lives in the
 * root layout so the <audio> element (and its playback) survives route
 * changes. Two surfaces consume it:
 *   • MusicDisk  — the vinyl widget, shown only inside Selected Work / Timeline
 *   • Nav        — the sound-bars toggle, shown once Selected Work is reached
 *
 * Volume rules:
 *   • in the Work/Timeline zone → full volume
 *   • anywhere else, while playing → 15% of full, faded down over 1s
 *   • user paused → silent + paused
 */
export type Track = { name: string; artist: string; src: string; cover: string };

const TRACKS: Track[] = [
  { name: "Feel It Still", artist: "Portugal. The Man", src: "/audio/1.mp3", cover: "/audio/1.jpg" },
  { name: "Rasputin", artist: "Boney M.", src: "/audio/2.webm", cover: "/audio/2.webp" },
  { name: "End of Beginning", artist: "Djo", src: "/audio/3.mp3", cover: "/audio/3.webp" },
  { name: "Slipping Through My Fingers", artist: "ABBA", src: "/audio/4.mp3", cover: "/audio/4.webp" },
];

const TARGET_VOL = 0.4;
const LOW_VOL = TARGET_VOL * 0.15; // out-of-zone background level
const LOW_FADE = 1000; // ms — gentle 1s dip when leaving the zone
const IN_FADE = 300;
const SECTIONS = ["work", "journey"]; // full-volume zone

type Ctx = {
  tracks: Track[];
  idx: number;
  track: Track;
  reached: boolean; // Selected Work seen at least once (persists this session)
  paused: boolean; // user toggled off
  inZone: boolean; // Work/Timeline currently on screen
  active: boolean; // reached && !paused → audio should be sounding
  hasCover: boolean;
  setHasCover: (v: boolean) => void;
  togglePaused: () => void;
  next: () => void;
  prev: () => void;
};

const MusicCtx = createContext<Ctx | null>(null);

export function useMusic() {
  const c = useContext(MusicCtx);
  if (!c) throw new Error("useMusic must be used inside <MusicProvider>");
  return c;
}

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [reached, setReached] = useState(false); // persisted: nav bars visibility
  const [started, setStarted] = useState(false); // runtime only: audio may sound
  const [paused, setPaused] = useState(false);
  const [inZone, setInZone] = useState(false);
  const [idx, setIdx] = useState(0);
  const [hasCover, setHasCover] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<number | null>(null);
  // refs mirror state so the one-time gesture handler reads fresh values
  const startedRef = useRef(started);
  startedRef.current = started;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const inZoneRef = useRef(inZone);
  inZoneRef.current = inZone;

  const track = TRACKS[idx];
  const active = started && !paused;

  // NOT persisted: on a fresh load / refresh the nav bars stay hidden until the
  // user actually reaches Selected Work. Client-side route changes keep this
  // provider mounted, so once reached the bars remain visible everywhere.
  const markReached = () => setReached(true);

  const fadeTo = (target: number, ms = 300, thenPause = false) => {
    const a = audioRef.current;
    if (!a) return;
    if (fadeRef.current) window.clearInterval(fadeRef.current);
    const interval = 30;
    const steps = Math.max(1, Math.round(ms / interval));
    const step = (target - a.volume) / steps;
    fadeRef.current = window.setInterval(() => {
      const a2 = audioRef.current;
      if (!a2) return;
      const next = a2.volume + step;
      if ((step >= 0 && next >= target) || (step < 0 && next <= target)) {
        a2.volume = Math.max(0, Math.min(1, target));
        if (fadeRef.current) window.clearInterval(fadeRef.current);
        fadeRef.current = null;
        if (thenPause) a2.pause();
      } else {
        a2.volume = Math.max(0, Math.min(1, next));
      }
    }, interval);
  };

  const playTo = (target: number, ms: number) => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.volume = 0; // start silent → fade in
    a.play()
      .then(() => fadeTo(target, ms))
      .catch(() => {});
  };

  // observe the Work/Timeline zone. Re-runs per route since the sections only
  // exist on the home page; elsewhere the zone is simply absent (→ low volume).
  useEffect(() => {
    const zone = new Map<string, boolean>();
    let priv = false;
    const update = () => setInZone([...zone.values()].some(Boolean) && !priv);

    const zoneIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => zone.set(e.target.id, e.isIntersecting));
        update();
      },
      { threshold: 0 }
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) zoneIO.observe(el);
    });

    // latch "reached" once the Selected Work box scrolls into the top viewport
    const startIO = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) markReached();
      },
      { rootMargin: "0px 0px -80% 0px" }
    );
    const openMarker = document.getElementById("work-open");
    if (openMarker) startIO.observe(openMarker);

    // private band = past the timeline → out of the full-volume zone
    const endIO = new IntersectionObserver(
      ([e]) => {
        priv = e.isIntersecting;
        update();
      },
      { threshold: 0, rootMargin: "0px 0px -6% 0px" }
    );
    const pv = document.getElementById("private-band");
    if (pv) endIO.observe(pv);

    update();
    return () => {
      zoneIO.disconnect();
      startIO.disconnect();
      endIO.disconnect();
    };
  }, [pathname]);

  // music only begins once the user actually scrolls into the Work zone this
  // load (never on plain page load / refresh). `started` is NOT persisted.
  useEffect(() => {
    if (inZone) setStarted(true);
  }, [inZone]);

  // drive playback + volume from state. Once started it keeps playing; only a
  // manual pause stops it. Out of the zone it ducks to LOW_VOL over 1s.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!started || paused) {
      if (!a.paused) fadeTo(0, IN_FADE, true);
      return;
    }
    const target = inZone ? TARGET_VOL : LOW_VOL;
    const ms = inZone ? IN_FADE : LOW_FADE;
    if (a.paused) playTo(target, ms);
    else fadeTo(target, ms);
  }, [started, paused, inZone, idx]);

  // browsers block autoplay until a real gesture. On the first click/key/tap,
  // either start (if we're already reached & unpaused) or silently prime.
  useEffect(() => {
    const onGesture = () => {
      const a = audioRef.current;
      if (!a) return;
      if (startedRef.current) {
        // playback already began this session — NEVER re-prime or reset
        // currentTime (that would rewind on a pause→play tap, since pointerdown
        // fires before the click's togglePaused). If we should be sounding but
        // a programmatic play() was blocked, resume from the CURRENT position.
        if (!pausedRef.current && a.paused) {
          playTo(inZoneRef.current ? TARGET_VOL : LOW_VOL, IN_FADE);
        }
        return;
      }
      // first-ever gesture, before any playback: silently prime the element so
      // a later play() is allowed by autoplay policy, then rewind (nothing has
      // played yet).
      if (a.paused) {
        const v = a.volume;
        a.muted = true;
        a.play()
          .then(() => {
            a.pause();
            a.currentTime = 0;
            a.muted = false;
            a.volume = v;
          })
          .catch(() => {
            a.muted = false;
          });
      }
    };
    document.addEventListener("pointerdown", onGesture);
    document.addEventListener("keydown", onGesture);
    document.addEventListener("touchstart", onGesture, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onGesture);
      document.removeEventListener("keydown", onGesture);
      document.removeEventListener("touchstart", onGesture);
    };
  }, []);

  const changeTrack = (dir: number) => {
    if (TRACKS.length < 2) return;
    fadeTo(0);
    setHasCover(true);
    setIdx((i) => (i + dir + TRACKS.length) % TRACKS.length);
  };

  // song finished → roll to the next, wrapping past the last back to the first
  const onEnded = () => {
    setHasCover(true);
    setIdx((i) => (i + 1) % TRACKS.length);
  };

  const value: Ctx = {
    tracks: TRACKS,
    idx,
    track,
    reached,
    paused,
    inZone,
    active,
    hasCover,
    setHasCover,
    // first tap on the nav bars (before scrolling into Work) starts playback;
    // afterwards it toggles pause/resume
    togglePaused: () => {
      if (!startedRef.current) {
        setStarted(true);
        setPaused(false);
        return;
      }
      setPaused((p) => !p);
    },
    next: () => changeTrack(1),
    prev: () => changeTrack(-1),
  };

  return (
    <MusicCtx.Provider value={value}>
      {/* audio lives here so playback survives route changes. No loop — tracks
          advance on end via onEnded, wrapping back to the first. */}
      <audio ref={audioRef} src={track.src} onEnded={onEnded} preload="auto" />
      {children}
    </MusicCtx.Provider>
  );
}
