"use client";

/**
 * Trust & privacy.
 *
 * Left: a live action log that types itself out — showing the work is the
 * whole claim, so the section demonstrates it rather than asserting it.
 * Right: a consent switch that starts OFF and stays OFF unless you flip it.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Eye, ShieldCheck, Lock } from "lucide-react";
import { ScrollHighlightText } from "@/components/premium/Parallax";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { t: "12:04:11", label: "Parsed CV", detail: "priya_sharma_resume.pdf · 6 yrs · Go, Kafka" },
  { t: "12:04:19", label: "Searched roles", detail: "remote · India-eligible · 214 scanned" },
  { t: "12:04:27", label: "Filtered out", detail: "38 listings marked hybrid — bakwas, hata diya" },
  { t: "12:04:36", label: "Scored matches", detail: "12 roles ≥ 70% · reasons attached" },
  { t: "12:04:48", label: "Found hiring manager", detail: "public profile · 1 role" },
  { t: "12:05:02", label: "Drafted intro", detail: "awaiting your approval — not sent" },
  { t: "12:05:02", label: "Stopped", detail: "consent required to continue" },
];

export function Trust() {
  return (
    <section id="trust" className="relative overflow-hidden py-28">
      <div aria-hidden className="absolute inset-0 bg-dots opacity-[0.35] mask-fade-y" />

      <div className="relative mx-auto max-w-wide px-6">
        <div className="mx-auto max-w-page text-center">
          <span className="eyebrow mb-6">Trust &amp; privacy</span>
          <h2 className="text-h1 font-display">
            <span className="text-gradient">Har action dikhta hai.</span>{" "}
            <span className="text-gradient-accent">Har decision tera hai.</span>
          </h2>
          <ScrollHighlightText
            text="Hireschema AI jo bhi karta hai wo logged hai. Aur jo bhi bhejna hai, wo tere approve karne ke baad hi jaata hai."
            className="mx-auto mt-6 max-w-prose justify-center text-center text-lead text-ink-700"
          />
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <ActionLog />

          <div className="flex flex-col gap-6">
            <ConsentCard />
            <div className="glass-strong rounded-3xl p-7 edge-light">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/40 bg-paper-0/60">
                <Lock className="h-5 w-5 text-accent" strokeWidth={1.9} />
              </span>
              <h3 className="mt-5 font-display text-h3 text-ink-900">
                Data ka galat istemaal? Bilkul nahi.
              </h3>
              <p className="mt-2 text-body text-ink-500">
                DPDP Act 2023 compliant. Mumbai region storage. Tumhara CV kisi
                recruiter database mein bech-becha nahi jaata — kabhi nahi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionLog() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(ACTIONS.length);
      return;
    }
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= ACTIONS.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 420);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="glass-strong overflow-hidden rounded-3xl edge-light shadow-block"
    >
      <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Eye className="h-4 w-4 text-accent" strokeWidth={2} />
          <p className="text-small font-semibold text-ink-800">
            Hireschema AI performed {shown} actions
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-ink-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Live
        </span>
      </div>

      <ol className="divide-y divide-ink-100 font-mono text-small">
        {ACTIONS.slice(0, shown).map((a, i) => (
          <motion.li
            key={a.t + a.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-4 px-6 py-3.5"
          >
            <span className="shrink-0 text-ink-400">{a.t}</span>
            <span
              className={cn(
                "shrink-0 font-semibold",
                i === ACTIONS.length - 1 ? "text-masala" : "text-accent",
              )}
            >
              {a.label}
            </span>
            <span className="text-ink-500">{a.detail}</span>
          </motion.li>
        ))}
        {shown < ACTIONS.length && (
          <li className="px-6 py-3.5 font-mono text-small text-ink-400">
            <span className="animate-blink">▍</span>
          </li>
        )}
      </ol>

      <div className="border-t border-ink-100 px-6 py-3.5 text-[11px] uppercase tracking-[0.14em] text-ink-400">
        Har search, har score, har outreach — sab logged, sab visible.
      </div>
    </div>
  );
}

function ConsentCard() {
  const [on, setOn] = useState(false);

  return (
    <div className="glass-strong rounded-3xl p-7 edge-light">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-masala/40 bg-paper-0/60">
            <ShieldCheck className="h-5 w-5 text-masala" strokeWidth={1.9} />
          </span>
          <h3 className="mt-5 font-display text-h3 text-ink-900">
            Recruiter discovery
          </h3>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Toggle recruiter discovery"
          onClick={() => setOn((v) => !v)}
          className={cn(
            "relative mt-1 h-8 w-14 shrink-0 rounded-none border transition-colors duration-base",
            on
              ? "border-accent/60 bg-accent/25"
              : "border-ink-200 bg-ink-100",
          )}
        >
          <motion.span
            animate={{ x: on ? 26 : 3 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className={cn(
              "absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full shadow-block",
              on ? "bg-accent" : "bg-ink-400",
            )}
          />
        </button>
      </div>

      <p className="mt-3 text-body text-ink-500">
        {on
          ? "Ab recruiters tumhari public profile dekh sakte hain. Jab chaaho, wapas OFF."
          : "OFF hai. Jab tak tum khud on nahi karte, koi recruiter tumhe dhoondh nahi sakta."}
      </p>

      <p className="mt-5 border-l-2 border-masala/70 pl-4 font-display text-[clamp(1rem,2vw,1.25rem)] font-extrabold leading-snug text-[#FFE45E] [text-shadow:0_2px_0_#000,0_-2px_0_#000,2px_0_0_#000,-2px_0_0_#000]">
        Hum koi mandir ka ghanta hain, ki koi bhi aake baja jaye?
      </p>
    </div>
  );
}
