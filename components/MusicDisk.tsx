"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMusic } from "@/components/MusicProvider";

/**
 * Vinyl widget. Shown only inside Selected Work / Timeline. All playback state
 * lives in MusicProvider — this is just the disc UI + track controls. The
 * sound-bars toggle in the nav handles pause/resume everywhere else.
 */
export function MusicDisk() {
  const {
    tracks,
    track,
    reached,
    inZone,
    active,
    paused,
    hasCover,
    setHasCover,
    togglePaused,
    next,
    prev,
  } = useMusic();

  const show = reached && inZone;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed left-[var(--edge)] z-40 flex items-center gap-2"
          style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.35 }}
        >
          {tracks.length > 1 && (
            <button
              onClick={prev}
              aria-label="Previous track"
              className="-m-1 flex h-11 w-11 items-center justify-center rounded-full font-mono text-lg text-ink-soft transition-colors hover:bg-white/10 hover:text-accent"
            >
              ‹
            </button>
          )}

          <button
            onClick={togglePaused}
            aria-label={paused ? "Play music" : "Mute music"}
            data-cursor-label={paused ? "play" : "mute"}
            className="relative h-14 w-14 shrink-0 rounded-full"
          >
            {/* vinyl record: black grooved disc, cover as centre label, spindle hole */}
            <motion.div
              className="absolute inset-0 overflow-hidden rounded-full shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, #262626 0%, #0b0b0b 58%, #000 100%)",
              }}
              animate={{ rotate: active ? 360 : 0 }}
              transition={
                active
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
              {paused ? "▶" : "❚❚"}
            </span>
          </button>

          {tracks.length > 1 && (
            <button
              onClick={next}
              aria-label="Next track"
              className="-m-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-mono text-lg text-ink-soft transition-colors hover:bg-white/10 hover:text-accent"
            >
              ›
            </button>
          )}

          <div className="ml-1">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.25em] text-ink-soft">
              {active ? "now playing" : "paused"}
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
  );
}
