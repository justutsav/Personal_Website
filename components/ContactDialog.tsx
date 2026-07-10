"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Magnetic } from "@/components/Magnetic";
import { CONTACT_CHANNELS, CONTACT_EMAIL } from "@/data/contact";

/**
 * "Let's talk" — most clients don't live in email, so the CTA opens a picker
 * of every channel they might: chat apps, professional networks, plus a
 * copy-email row for the ones who do. Channels with unfilled handles
 * (href: null) stay hidden.
 */
export function ContactDialog() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const channels = CONTACT_CHANNELS.filter((c) => c.href);

  return (
    <>
      <Magnetic>
        <button
          onClick={() => setOpen(true)}
          data-cursor-label="talk"
          className="inline-block rounded-full bg-accent px-8 py-4 font-mono text-small uppercase tracking-widest text-[var(--paper)] transition-colors duration-300 hover:bg-accent-deep"
        >
          Let&apos;s talk →
        </button>
      </Magnetic>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Contact channels"
              data-lenis-prevent
              className="max-h-[86svh] w-[min(30rem,94vw)] overflow-y-auto rounded-2xl border border-line bg-paper-raised p-7 shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
              initial={{ y: 32, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-micro uppercase tracking-[0.25em] text-accent">
                  Pick your channel
                </p>
                <button
                  onClick={() => setOpen(false)}
                  data-cursor-label="close"
                  className="font-mono text-small text-ink-soft transition-colors hover:text-ink"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <h2 className="font-display mt-3 text-2xl font-extrabold uppercase leading-tight">
                Wherever you already are.
              </h2>

              <div className="mt-6 space-y-2">
                {channels.map((c) => (
                  <a
                    key={c.id}
                    href={c.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-label="open"
                    className="group flex items-center gap-4 rounded-xl border border-line px-4 py-3.5 transition-colors duration-200 hover:border-accent"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg font-mono text-small font-bold"
                      style={{ background: `${c.color}1f`, color: c.color }}
                    >
                      {c.badge}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-base font-bold uppercase">
                        {c.label}
                      </span>
                      <span className="block truncate font-mono text-micro text-ink-soft">
                        {c.handle}
                      </span>
                    </span>
                    <span className="ml-auto font-mono text-small text-ink-soft transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent">
                      →
                    </span>
                  </a>
                ))}

                {/* email — card opens a Gmail compose prefilled; the copy
                    button only copies (stopPropagation keeps them separate) */}
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=Something%20that%20should%20exist`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="email"
                  className="group flex w-full items-center gap-4 rounded-xl border border-line px-4 py-3.5 text-left transition-colors duration-200 hover:border-accent"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/12 font-mono text-small font-bold text-accent">
                    @
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-base font-bold uppercase">
                      Email
                    </span>
                    <span className="block truncate font-mono text-micro text-ink-soft">
                      {CONTACT_EMAIL}
                    </span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigator.clipboard?.writeText(CONTACT_EMAIL).then(
                        () => setCopied(true),
                        () => {}
                      );
                    }}
                    data-cursor-label="copy"
                    aria-label="Copy email address"
                    className="ml-auto rounded-full border border-line px-3 py-1.5 font-mono text-micro uppercase tracking-widest text-ink-soft transition-colors hover:border-accent hover:text-accent"
                  >
                    {copied ? "copied ✓" : "copy"}
                  </button>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
