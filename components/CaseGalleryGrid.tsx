"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export type GalleryItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * Orientation-aware screenshot grid with a tap-to-zoom lightbox.
 * Landscape images span half the row (2-per-row), portrait phone shots a
 * third (3-per-row); a 6-column grid lets mixed batches pack naturally.
 * Clicking any tile opens it full-screen; ← → arrows step through, Esc or
 * a click anywhere closes.
 */
export function CaseGalleryGrid({
  items,
  equal = false,
}: {
  items: GalleryItem[];
  /** true → all shots are peers (no hero): one even grid, all same level */
  equal?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback(
    (dir: number) =>
      setOpen((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, step]);

  return (
    <>
      {equal ? (
        // no hero — every shot a peer, one even row (4-across on desktop)
        <div className="my-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setOpen(i)}
              data-cursor-label="zoom"
              className="group flex cursor-zoom-in items-center justify-center overflow-hidden rounded-lg border border-line transition-colors duration-200 hover:border-accent"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 768px) 24vw, 45vw"
                className="h-auto max-h-[34vh] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </button>
          ))}
        </div>
      ) : (
        // main hero on the LEFT, a faint divider, the rest gridded on the RIGHT
        <div className="my-16 flex flex-col gap-8 md:flex-row md:gap-0">
          <div className="md:flex-1 md:pr-8">
            <button
              type="button"
              onClick={() => setOpen(0)}
              data-cursor-label="zoom"
              className="group block w-full cursor-zoom-in"
            >
              <Image
                src={items[0].src}
                alt={items[0].alt}
                width={items[0].width}
                height={items[0].height}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="h-auto max-h-[62vh] w-full rounded-lg border border-line object-contain transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </button>
          </div>

          {items.length > 1 && (
            <div className="grid grid-cols-2 content-start gap-4 md:flex-1 md:border-l md:border-line md:pl-8">
              {items.slice(1).map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setOpen(i + 1)}
                  data-cursor-label="zoom"
                  className="group flex cursor-zoom-in items-center justify-center overflow-hidden rounded-lg border border-line transition-colors duration-200 hover:border-accent"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    sizes="(min-width: 768px) 24vw, 45vw"
                    className="h-auto max-h-[30vh] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              key={items[open].src}
              className="relative max-h-full max-w-full"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* plain img: the lightbox wants the original file at natural
                  resolution, no next/image resizing pass */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={items[open].src}
                alt={items[open].alt}
                className="max-h-[90vh] max-w-full rounded-lg object-contain"
              />
            </motion.div>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/40 px-4 py-3 font-mono text-small text-white/85 transition-colors duration-200 hover:border-accent hover:text-accent md:left-8"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/40 px-4 py-3 font-mono text-small text-white/85 transition-colors duration-200 hover:border-accent hover:text-accent md:right-8"
                >
                  →
                </button>
              </>
            )}

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-micro uppercase tracking-widest text-white/60">
              {String(open + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")} · esc to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
