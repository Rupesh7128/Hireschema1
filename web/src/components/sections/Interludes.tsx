"use client";

/**
 * The two scenes that the <ZoomThrough/> transitions reveal.
 *
 * These render inside a sticky, viewport-filling stage, so each one has to
 * fill its own height and centre its own content.
 */

import { motion } from "framer-motion";
import { MemeGif } from "@/components/premium/MemeGif";

/* ── Scene revealed through "DOGLAPAN" ───────────────────────────────────── */

const VOID_ITEMS = [
  "Applied · no response",
  "Applied · no response",
  "Applied · viewed, no response",
  "Applied · no response",
  "Applied · rejected after 41 days",
  "Applied · no response",
  "Applied · 'we'll keep your CV on file'",
  "Applied · no response",
];

export function VoidScene() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-paper-0">
      <div aria-hidden className="absolute inset-0">
        <div className="pool-chai absolute left-1/2 top-1/2 h-[60vh] w-[60vw] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 bg-grid-sm opacity-40 mask-fade-y" />
      </div>

      <div className="relative mx-auto grid max-w-wide items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <span className="eyebrow mb-6">The problem</span>
          <h2 className="font-display text-h1">
            <span className="text-gradient">Zindagi jhand ba,</span>
            <br />
            <span className="text-gradient-accent">tab bhi portals pe ghamand ba.</span>
          </h2>
          <p className="mt-6 max-w-prose text-lead text-ink-500">
            Tum CV void mein phenkte raho, unka dashboard &lsquo;12,000 applicants&rsquo;
            dikhata rahe. Ekdum se waqt badal denge, jazbaat badal denge — par
            pehle ye doglapan band karna padega.
          </p>

          <dl className="mt-9 grid grid-cols-3 gap-4">
            {[
              { v: "250+", l: "applications per hire, average" },
              { v: "41", l: "days to a rejection email" },
              { v: "2%", l: "ever reach a human" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-xl px-4 py-4">
                <dt className="font-display text-h2 text-chai">{s.v}</dt>
                <dd className="mt-1 text-[12px] leading-snug text-ink-400">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The void itself, with the mood attached */}
        <div className="relative hidden h-[52vh] lg:block">
          <MemeGif
            name="dukh"
            className="absolute -top-6 right-0 z-10 w-[210px] rotate-[3deg] shadow-3"
          />
          <div className="absolute inset-0 mask-fade-y">
            <motion.ul
              animate={{ y: ["0%", "-50%"] }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="space-y-2.5"
            >
              {[...VOID_ITEMS, ...VOID_ITEMS].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-ink-100 bg-paper-1/60 px-4 py-3 font-mono text-small text-ink-400"
                  style={{ opacity: 1 - (i % VOID_ITEMS.length) * 0.07 }}
                >
                  <span>{item}</span>
                  <span className="text-ink-300">—</span>
                </li>
              ))}
            </motion.ul>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-paper-0 to-transparent" />
        </div>
      </div>
    </div>
  );
}

/* ── Scene revealed through "AUKAT" ──────────────────────────────────────── */

export function ScoreScene() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-paper-0">
      <div aria-hidden className="absolute inset-0">
        <div className="pool-volt absolute left-1/2 top-1/2 h-[55vh] w-[65vw] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 bg-dots opacity-30 mask-fade-y" />
      </div>

      <div className="relative mx-auto max-w-page px-6 text-center">
        <span className="eyebrow mb-7">Match scoring</span>
        <h2 className="font-display text-h1">
          <span className="text-gradient">Aukat dikha di —</span>{" "}
          <span className="text-gradient-accent">achhe tareeke se.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-prose text-lead text-ink-500">
          Har role ko 0–100 score milta hai, aur saath mein plain-English wajah.
          Jahan fit ho, wahan bhi. Jahan nahi ho, wahan bhi.
        </p>

        <div className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-4">
          {[
            { k: "Skills", v: 92, c: "text-accent" },
            { k: "Seniority", v: 84, c: "text-accent" },
            { k: "Location", v: 100, c: "text-accent" },
            { k: "Comp band", v: 61, c: "text-masala" },
          ].map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-2xl px-4 py-6"
            >
              <p className={`font-mono text-h1 font-bold leading-none ${s.c}`}>
                {s.v}
              </p>
              <p className="mt-2 text-small text-ink-400">{s.k}</p>
            </motion.div>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center">
          <MemeGif name="tumseNaHoPayega" className="w-[220px] shrink-0 -rotate-2 shadow-3" />
          <p className="font-display text-[clamp(1.05rem,2.2vw,1.5rem)] font-extrabold leading-snug text-[#FFE45E] [text-shadow:0_2px_0_#000,0_-2px_0_#000,2px_0_0_#000,-2px_0_0_#000] sm:text-left">
            Comp band thoda kam? Ho jayega — roadmap ready hai.
          </p>
        </div>
      </div>
    </div>
  );
}
