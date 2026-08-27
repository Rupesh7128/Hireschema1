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
  { action: "Applied", result: "no response", resClass: "text-ink-400" },
  { action: "Applied", result: "no response", resClass: "text-ink-400" },
  { action: "Applied", result: "viewed, no response", resClass: "text-chai/90" },
  { action: "Applied", result: "no response", resClass: "text-ink-400" },
  { action: "Applied", result: "rejected after 41 days", resClass: "text-[#EF4444]/90" },
  { action: "Applied", result: "no response", resClass: "text-ink-400" },
  { action: "Applied", result: "'we'll keep your CV on file'", resClass: "text-accent/80" },
  { action: "Applied", result: "no response", resClass: "text-ink-400" },
];

export function VoidScene() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-paper-0">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-sm opacity-40 mask-fade-y" />
      </div>

      <div className="relative mx-auto grid max-w-wide items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <span className="eyebrow mb-6">The problem</span>
          <h2 className="font-display text-h1">
            <span className="text-gradient">250 applications.</span>
            <br />
            <span className="text-gradient-accent">Ek bhi jawab nahi.</span>
          </h2>
          <p className="mt-6 max-w-prose text-lead text-ink-500">
            Tu CV bhejta ja, unka dashboard &lsquo;12,000 applicants&rsquo; dikhata
            rahe. Koi padhta hi nahi. Problem tera CV nahi hai — problem ye hai
            ki wo kisi insaan tak pahunchta hi nahi.
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
            name="raviSad"
            className="absolute -top-6 right-0 z-10 w-[210px] rotate-[3deg] shadow-block"
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
                  className="flex items-center justify-between rounded-lg border border-ink-100 bg-paper-1/60 px-4 py-3 font-mono text-small"
                >
                  <span>
                    <span className="text-ink-500">{item.action}</span>
                    <span className="text-ink-600 mx-2">·</span>
                    <span className={item.resClass}>{item.result}</span>
                  </span>
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

        <p className="mx-auto mt-9 max-w-prose font-display text-[clamp(1.05rem,2.2vw,1.5rem)] font-extrabold leading-snug text-[#FFE45E] [text-shadow:0_2px_0_#000,0_-2px_0_#000,2px_0_0_#000,-2px_0_0_#000]">
          Comp band thoda kam? Roadmap ready hai.
        </p>
      </div>
    </div>
  );
}
