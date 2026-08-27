"use client";

/**
 * How it works — pinned horizontal scroll.
 *
 * The section is 400vh tall; inside it a sticky viewport slides four panels
 * sideways. Each panel rotates on Y as it approaches and leaves centre, so the
 * rail reads as a carousel of physical cards rather than a filmstrip.
 *
 * Below lg the same panels stack vertically — horizontal pinning on a phone
 * fights the user's thumb.
 */

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Upload, Search, Bookmark, FileText, Send, Radar, Gauge, Sparkles } from "@/components/brand/icons";
import { MemeGif } from "@/components/premium/MemeGif";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    icon: Upload,
    title: "\“Aaiye dekhte hain mazaa aayega\” — Bas apna CV upload kar",
    body: "Faltu ka gyaan mat baant, seedha apna CV upload kar aur bata tujhe kya chahiye. Role, salary, location daal aur baith ja. Baaki ka jadoo dekh fir kya kya hota hai.",
    punch: "1-Click Upload · CV Parsing",
    tone: "accent" as const,
    mock: "mazaa",
  },
  {
    n: "02",
    icon: Search,
    title: "“Tu ghar jaake sutti babu!”",
    body: "Hireschema AI thakega nahi. Tu aaraam kar, aur AI tere liye 24x7 global remote jobs dhundh ke nikalega ekdum radar ki tarah.",
    punch: "24/7 Automated Search • Remote Jobs Only",
    tone: "masala" as const,
    mock: "radar",
  },
  {
    n: "03",
    icon: Bookmark,
    title: "\“Binod nhi dekh rha but Extention sab dekh rha\”",
    body: "Internet pe kahin bhi badiya job dikhi? Hireschema Chrome extension use kar aur ek click mein save aur track kar. No scattered tabs, no doglapan—sab kuch ek single, clean dashboard pe.",
    punch: "Chrome Extension · Unified Tracking",
    tone: "volt" as const,
    mock: "score",
  },
  {
    n: "04",
    icon: FileText,
    title: "\“Aisa koi kaam nahi jo AI ne nahi kiya ho\” — Tailored Everything",
    body: "Har job ka apna nakhra hota hai. Isliye Hireschema AI tujhe har specific role ke liye ek Tailored CV, custom Cover Letter, aur mock Interview Prep bana ke dega. Tension nahi lene ka, apun hai na.",
    punch: "Custom CV · Cover Letters · AI Mock Interviews",
    tone: "chai" as const,
    mock: "document",
  },
  {
    n: "05",
    icon: Send,
    title: "\“Toh kar na!\” — Seedha apply kar aur track kar",
    body: "Ab kiska wait kar raha hai? Tera arsenal ready hai. Seedha apply kar aur apni applications ko live track kar. Bete mauj kardi, waah bete waah! Offer letter tera intezaar kar raha hai.",
    punch: "1-Click Apply · Live Status Tracking",
    tone: "accent" as const,
    mock: "email",
  }
];

const TONE = {
  accent: { text: "text-accent", bg: "bg-accent", border: "border-accent", rule: "bg-accent" },
  masala: { text: "text-masala", bg: "bg-masala", border: "border-masala", rule: "bg-masala" },
  volt:   { text: "text-volt",   bg: "bg-volt",   border: "border-volt",   rule: "bg-volt" },
  chai:   { text: "text-chai",   bg: "bg-chai",   border: "border-chai",   rule: "bg-chai" },
} as const;

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const x = useTransform(p, [0, 1], ["0%", "-80%"]);

  return (
    <>
      {/* Header lives outside the pinned rail so it can scroll normally. */}
      <div className="relative mx-auto max-w-page px-6 pb-16 pt-28 text-center">
        <span className="eyebrow mb-6">How Hireschema works</span>
        <h2 className="text-h1 font-display">
          <span className="text-gradient">&ldquo;Aap chronology</span>{" "}
          <span className="text-gradient-accent">samajhiye&rdquo;</span>
        </h2>
        <p className="mx-auto mt-5 max-w-prose text-lead text-ink-500">
          CV se lekar intro tak — chaar step, usi order mein. Har step pe tu
          dekh sakta hai AI ne kya kiya, aur kyun.
        </p>
      </div>

      {/* Desktop: pinned horizontal rail. */}
      <section ref={ref} className="relative hidden h-[420vh] lg:block">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden perspective-far">
          <ProgressRail progress={p} />
          <motion.div
            style={reduced ? undefined : { x }}
            className="flex w-[500vw] gap-8 px-[8vw] will-transform"
          >
            {STEPS.map((step, i) => (
              <Panel key={step.n} step={step} index={i} progress={p} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mobile / tablet: plain vertical stack. */}
      <section className="mx-auto flex max-w-page flex-col gap-6 px-6 pb-24 lg:hidden">
        {STEPS.map((step) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <StepCard step={step} />
          </motion.div>
        ))}
      </section>
    </>
  );
}

function ProgressRail({ progress }: { progress: MotionValue<number> }) {
  const width = useTransform(progress, [0, 1], ["4%", "100%"]);
  return (
    <div className="absolute inset-x-[8vw] bottom-[10vh] z-20 h-[3px] rounded-none bg-ink-100">
      <motion.div
        style={{ width }}
        className="h-full rounded-none bg-gradient-to-r from-accent via-masala to-chai shadow-[0_0_16px_rgba(159,232,112,0.6)]"
      />
      <div className="mt-4 flex justify-between text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-400">
        {STEPS.map((s) => (
          <span key={s.n}>{s.n}</span>
        ))}
      </div>
    </div>
  );
}

function Panel({
  step,
  index,
  progress,
}: {
  step: (typeof STEPS)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  // Each panel owns a 1/4 slice of the rail. Centre of its slice = flat on.
  const centre = index / (STEPS.length - 1);
  const span = 0.42;
  const rotateY = useTransform(
    progress,
    [centre - span, centre, centre + span],
    [26, 0, -26],
  );
  const scale = useTransform(
    progress,
    [centre - span, centre, centre + span],
    [0.88, 1, 0.88],
  );
  const opacity = useTransform(
    progress,
    [centre - span * 1.4, centre, centre + span * 1.4],
    [0.35, 1, 0.35],
  );

  return (
    <motion.div
      style={{ rotateY, scale, opacity, transformStyle: "preserve-3d" }}
      className="w-[84vw] shrink-0 will-transform"
    >
      <StepCard step={step} large />
    </motion.div>
  );
}

function StepCard({
  step,
  large = false,
}: {
  step: (typeof STEPS)[number];
  large?: boolean;
}) {
  const tone = TONE[step.tone];
  const Icon = step.icon;

  return (
    <article
      className={cn(
        "glass-solid relative overflow-hidden rounded-3xl edge-light",
        large ? "grid grid-cols-[1.05fr_0.95fr] gap-10 p-12" : "p-7",
      )}
    >
      <div aria-hidden className={cn("absolute inset-x-0 top-0 h-[3px]", tone.rule)} />

      {/* Oversized ghost numeral */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute font-display font-extrabold leading-none text-outline",
          large ? "-right-4 -top-14 text-[16rem]" : "-right-2 -top-8 text-[8rem]",
        )}
      >
        {step.n}
      </span>

      <div className="relative">
        <div className="mb-6 flex items-center gap-3">
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border bg-paper-0/70",
              tone.border,
            )}
          >
            <Icon className={cn("h-5 w-5", tone.text)} strokeWidth={2} />
          </span>
          <span className="text-micro uppercase text-ink-400">
            Step {step.n}
          </span>
        </div>

        <h3
          className={cn(
            "mb-4 font-display font-bold text-ink-900",
            large ? "text-h1" : "text-h2",
          )}
        >
          {step.title}
        </h3>

        <p className={cn("text-ink-500", large ? "text-lead" : "text-body")}>
          {step.body}
        </p>

        <p
          className={cn(
            `mt-7 font-display font-extrabold leading-tight text-[#FFE45E]
             [text-shadow:0_2px_0_#000,0_-2px_0_#000,2px_0_0_#000,-2px_0_0_#000]`,
            large ? "text-[clamp(1.5rem,3vw,2.25rem)]" : "text-[clamp(1.2rem,4.4vw,1.5rem)]",
          )}
        >
          {step.punch}
        </p>
      </div>

      {large && (
        <div className="relative flex items-center justify-center">
          <StepMock kind={step.mock} tone={step.tone} />
        </div>
      )}
    </article>
  );
}

/* ── Per-step product mocks ─────────────────────────────────────────────── */

function StepMock({ kind, tone }: { kind: string; tone: keyof typeof TONE }) {
  const t = TONE[tone];

  if (kind === "voice")
    return (
      <div className="w-full rounded-2xl border border-ink-200/70 bg-paper-0/80 p-5">
        <p className="mb-4 text-micro uppercase text-ink-400">Voice note · en-IN</p>
        <div className="flex h-16 items-center gap-[3px]">
          {Array.from({ length: 26 }, (_, i) => {
            // Deterministic so server and client agree — Math.random() here
            // both breaks hydration and re-rolls on every render.
            const peak = 0.3 + ((i * 37) % 11) / 14;
            return (
              <motion.span
                key={i}
                animate={{ scaleY: [0.25, peak, 0.25] }}
                transition={{
                  duration: 1.1 + (i % 5) * 0.14,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.05,
                }}
                className={cn("h-full w-full rounded-none", t.bg)}
                style={{ opacity: 0.35 + (i % 4) * 0.16, transformOrigin: "center" }}
              />
            );
          })}
        </div>
        <p className="mt-5 text-body text-ink-600">
          &ldquo;Backend engineer, 6 saal Go aur Kafka, fully remote, 40 LPA se
          upar.&rdquo;
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Go", "Kafka", "Remote", "40+ LPA"].map((chip) => (
            <span
              key={chip}
              className={cn("rounded-none border px-2.5 py-1 text-[11px] font-semibold", t.border, t.text)}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    );

  if (kind === "mazaa")
    return (
      <div className="relative w-[320px] overflow-hidden rounded-2xl border border-ink-200/70 bg-paper-0/80 shadow-block">
        <img 
          src="https://media1.tenor.com/m/NyPzonwL-ycAAAAC/asraj-tsp.gif" 
          alt="Maza aayega meme" 
          className="w-full object-cover"
        />
      </div>
    );

  if (kind === "radar")
    return (
      <div className="relative w-full rounded-2xl border border-ink-200/70 bg-paper-0/80 p-5">
        <p className="mb-4 text-micro uppercase text-ink-400">Remote-only filter</p>
        <div className="relative mx-auto aspect-square w-full max-w-[180px]">
          {[1, 0.7, 0.42].map((s, i) => (
            <div
              key={i}
              className={cn("absolute inset-0 rounded-none border", t.border)}
              style={{ transform: `scale(${s})`, opacity: 0.5 - i * 0.1 }}
            />
          ))}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 origin-center"
            style={{
              background: `conic-gradient(from 0deg, ${
                tone === "masala" ? "rgba(255,176,32,0.4)" : "rgba(159,232,112,0.4)"
              }, transparent 28%)`,
              borderRadius: "9999px",
            }}
          />
          {[
            { l: "28%", t: "22%", ok: true },
            { l: "68%", t: "38%", ok: true },
            { l: "44%", t: "70%", ok: false },
            { l: "78%", t: "72%", ok: true },
          ].map((dot, i) => (
            <span
              key={i}
              className={cn(
                "absolute h-2.5 w-2.5 rounded-full",
                dot.ok ? t.bg : "bg-destructive",
              )}
              style={{ left: dot.l, top: dot.t }}
            />
          ))}
        </div>
        <div className="mt-3 space-y-1.5 text-small">
          <p className="flex items-center gap-2 text-ink-600">
            <span className={cn("h-1.5 w-1.5 rounded-full", t.bg)} /> Fully remote · India OK
          </p>
          <p className="flex items-center gap-2 text-ink-400 line-through">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> &ldquo;Hybrid, 3 days office&rdquo;
          </p>
        </div>
        <MemeGif
          name="homeFromWork"
          className="absolute -bottom-6 -right-5 w-[130px] rotate-[5deg] shadow-block"
        />
      </div>
    );

  if (kind === "score")
    return (
      <div className="w-full space-y-3">
        {[
          { role: "Sr. Backend Engineer · Sydney (remote)", score: 91 },
          { role: "Platform Engineer · SF (remote)", score: 78 },
          { role: "Staff Engineer · Bengaluru (remote)", score: 64 },
        ].map((r, i) => (
          <div
            key={r.role}
            className={cn(
              "rounded-xl border bg-paper-0/80 p-4",
              i === 0 ? t.border : "border-ink-200/70",
            )}
          >
            <div className="mb-2.5 flex items-baseline justify-between gap-4">
              <p className="text-small font-medium text-ink-700">{r.role}</p>
              <p className={cn("font-mono text-h3 font-bold", i === 0 ? t.text : "text-ink-500")}>
                {r.score}%
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${r.score}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className={cn("h-full rounded-none", i === 0 ? t.bg : "bg-ink-300")}
              />
            </div>
          </div>
        ))}
        <p className="pt-1 text-small text-ink-400">
          Kyun fit ho, kyun nahi — dono likha hota hai.
        </p>
      </div>
    );

  if (kind === "document")
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border border-ink-200/70 bg-paper-0/80 p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-micro uppercase text-ink-400">Tailored Output</p>
          <span className={cn("flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider", t.bg, "text-paper-0")}>
            <Sparkles className="h-3 w-3" /> AI Generated
          </span>
        </div>
        
        <div className="relative space-y-4 rounded-xl border border-ink-100 bg-paper-1/50 p-5">
          {/* Skeleton Doc */}
          <div className="flex items-start gap-4">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-paper-0", t.border)}>
              <FileText className={cn("h-5 w-5", t.text)} strokeWidth={2} />
            </div>
            <div className="flex-1 space-y-2.5">
              <div className="h-3 w-3/4 rounded-full bg-ink-200" />
              <div className="h-2 w-full rounded-full bg-ink-100" />
              <div className="h-2 w-5/6 rounded-full bg-ink-100" />
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="h-2 w-full rounded-full bg-ink-100" />
            <div className="h-2 w-11/12 rounded-full bg-ink-100" />
            <motion.div 
              initial={{ width: "30%" }}
              whileInView={{ width: "80%" }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className={cn("h-2 rounded-full opacity-60", t.bg)} 
            />
          </div>
        </div>
      </div>
    );

  // email
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-ink-200/70 bg-paper-0/90 font-mono text-small">
      <div className="space-y-1.5 border-b border-ink-100 bg-ink-50/60 px-4 py-3">
        <p className="text-ink-400">
          From: <span className="text-ink-700">priya.sharma@gmail.com</span>
        </p>
        <p className="text-ink-400">
          To: <span className="text-ink-700">[HM · Razorpay Payments]</span>
        </p>
        <p className="text-ink-400">
          Subject: <span className="text-ink-700">Senior Backend Engineer — quick intro</span>
        </p>
      </div>
      <div className="space-y-3 px-4 py-4 leading-relaxed text-ink-500">
        <p>Hi [Name],</p>
        <p>
          Saw your team is hiring a Backend Engineer. Six years on Go and Kafka —
          Hireschema AI flagged an{" "}
          <span className={t.text}>87% match</span> on skills and comp band.
        </p>
        <p>15 minutes this week?</p>
        <p>— Priya</p>
      </div>
      <div className="flex items-center justify-between border-t border-ink-100 px-4 py-2.5">
        <span className="text-[11px] text-ink-400">Draft · not sent</span>
        <span className={cn("rounded-none px-3 py-1 text-[11px] font-semibold text-accent-fg", t.bg)}>
          Approve &amp; send
        </span>
      </div>
    </div>
  );
}
