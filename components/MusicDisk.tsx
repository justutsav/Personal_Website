"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Music widget scoped to the Selected Work + Timeline sections only. It
 * auto-starts when Selected Work comes on screen (after the first user
 * interaction, per autoplay rules), fades in/out, and hides everywhere else.
 * ‹ › switch tracks. Drop songs in /public/audio and add them to TRACKS.
 */
type Track = { name: string; artist: string; src: string; cover: string };
// NOTE: these songs are NOT licensed — used only as a personal-portfolio vibe.
// Credit shown in the widget. Full credits in public/audio/README.md.
const TRACKS: Track[] = [
  { name: "Feel It Still", artist: "Portugal. The Man", src: "/audio/1.mp3", cover: "/audio/1.jpg" },
  { name: "End of Beginning", artist: "Djo", src: "/audio/2.mp3", cover: "/audio/2.webp" },
  { name: "Slipping Through My Fingers", artist: "ABBA", src: "/audio/3.mp3", cover: "/audio/3.webp" },
  // add more: { name, artist, src: "/audio/4.mp3", cover: "/audio/4.jpg" },
];

const TARGET_VOL = 0.4;
const SECTIONS = ["work", "journey"]; // only visible/playing for these

export function MusicDisk() {
  const [enabled, setEnabled] = useState(true);
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);
  const [hasCover, setHasCover] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<number | null>(null);
  // refs mirror state so the one-time gesture handler reads fresh values
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  const track = TRACKS[idx];

  // active zone = Selected Work / Timeline in view, AFTER the section has
  // actually opened (past the #work-open marker), and BEFORE the private band
  // starts entering (which flips it off the instant you scroll off the outro).
  useEffect(() => {
    const zone = new Map<string, boolean>();
    let started = false; // latches true once you reach the opened section
    let priv = false;
    const update = () =>
      setVisible(started && [...zone.values()].some(Boolean) && !priv);

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

    // only latch once the box marker crosses into the TOP of the viewport, i.e.
    // the user is actually scrolling the Selected Work box — not on first sight
    const startIO = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) started = true;
        update();
      },
      { rootMargin: "0px 0px -80% 0px" }
    );
    const openMarker = document.getElementById("work-open");
    if (openMarker) startIO.observe(openMarker);

    const endIO = new IntersectionObserver(
      ([e]) => {
        priv = e.isIntersecting;
        update();
      },
      { threshold: 0, rootMargin: "0px 0px -6% 0px" }
    );
    const pv = document.getElementById("private-band");
    if (pv) endIO.observe(pv);

    return () => {
      zoneIO.disconnect();
      startIO.disconnect();
      endIO.disconnect();
    };
  }, []);

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

  const tryPlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.volume = 0; // start silent → 0.3s fade in
    a.play()
      .then(() => fadeTo(TARGET_VOL, 300))
      .catch(() => {});
  };

  // play while enabled AND in a scoped section; also react to track changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (enabled && visible) tryPlay();
    else fadeTo(0, 1000, true);
  }, [enabled, visible, idx]);

  // browsers block audio autoplay until a real gesture (a SCROLL doesn't count).
  // On the first click/key/tap: play if we're already in the zone, otherwise
  // silently prime the element so it can auto-start later without a gesture.
  useEffect(() => {
    const onGesture = () => {
      const a = audioRef.current;
      if (!a) return;
      if (enabledRef.current && visibleRef.current) {
        if (a.paused) tryPlay();
      } else if (a.paused) {
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

  const playing = enabled && visible;

  return (
    <>
      {/* audio stays mounted so it can fade out when leaving (widget can hide) */}
      <audio ref={audioRef} src={track.src} loop preload="auto" />
      <AnimatePresence>
        {visible && (
        <motion.div
          className="fixed bottom-6 left-[var(--edge)] z-40 flex items-center gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.35 }}
        >
          {TRACKS.length > 1 && (
            <button
              onClick={() => changeTrack(-1)}
              aria-label="Previous track"
              className="font-mono text-small text-ink-soft transition-colors hover:text-accent"
            >
              ‹
            </button>
          )}

          <button
            onClick={() => setEnabled((v) => !v)}
            aria-label={enabled ? "Mute music" : "Play music"}
            data-cursor-label={enabled ? "mute" : "play"}
            className="relative h-14 w-14 shrink-0 rounded-full"
          >
            {/* vinyl record: black grooved disc, cover as centre label, spindle hole */}
            <motion.div
              className="absolute inset-0 overflow-hidden rounded-full shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, #262626 0%, #0b0b0b 58%, #000 100%)",
              }}
              animate={{ rotate: playing ? 360 : 0 }}
              transition={
                playing
                  ? { duration: 4, repeat: Infinity, ease: "linear" }
                  : { duration: 0.4 }
              }
            >
              {/* grooves */}
              <span
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background:
                    "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 1px, transparent 1px, transparent 3px)",
                }}
              />
              {/* cover art as the record label */}
              <div className="absolute inset-[27%] overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.6)]">
                {hasCover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={track.cover}
                    src={track.cover}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setHasCover(false)}
                  />
                ) : (
                  <span
                    className="block h-full w-full"
                    style={{
                      background:
                        "conic-gradient(from 0deg, var(--accent), var(--accent-2), var(--accent))",
                    }}
                  />
                )}
              </div>
              {/* spindle hole */}
              <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#050505] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]" />
            </motion.div>
            {/* play/pause badge */}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] text-[var(--paper)]">
              {enabled ? "❚❚" : "▶"}
            </span>
          </button>

          {TRACKS.length > 1 && (
            <button
              onClick={() => changeTrack(1)}
              aria-label="Next track"
              className="font-mono text-small text-ink-soft transition-colors hover:text-accent"
            >
              ›
            </button>
          )}

          <div className="ml-1">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.25em] text-ink-soft">
              {playing ? "now playing" : "paused"}
            </p>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-accent-2">
              {track.name}
            </p>
            <p className="font-mono text-[0.52rem] uppercase tracking-[0.15em] text-ink-soft">
              {track.artist}
            </p>
          </div>

        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
