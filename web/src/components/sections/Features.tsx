"use client";

/**
 * Features — a sticky card deck.
 *
 * Every card sticks at the top with a small cumulative offset, so as you scroll
 * they pile up like a hand of cards being laid down. Each one scales down and
 * dims once the next card starts covering it, which is what gives the stack
 * real depth instead of a flat overlap.
 */

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  FileSearch,
  MessagesSquare,
  Target,
  MailCheck,
  Map,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
  punch: string;
  tone: "accent" | "masala" | "volt" | "chai";
  stat: { value: string; label: string };
};

const FEATURES: Feature[] = [
  {
    icon: FileSearch,
    title: "Free CV Review",
    body: "Apna résumé upload karo, elite recruiter scorecard milega. Impact, clarity, aur India-fit — teeno pe honest feedback.",
    punch: "ATS friendly hai ya nahi — 60 second mein pata chal jayega.",
    tone: "accent",
    stat: { value: "60 sec", label: "scorecard ready" },
  },
  {
    icon: MessagesSquare,
    title: "One Chat with AI",
    body: "Roles maango, applications tayyar karo — ek hi chat mein. Koi complicated workflow seekhne ki zaroorat nahi.",
    punch: "Tension nahi lene ka — apun hai na.",
    tone: "masala",
    stat: { value: "0", label: "dashboards to learn" },
  },
  {
    icon: Target,
    title: "Real Roles, Scored",
    body: "Live remote openings jo India se ho sakti hain, ranked by actual fit — keyword spam se nahi.",
    punch: "Keyword spam nahi. Asli data, asli reasons.",
    tone: "volt",
    stat: { value: "0–100", label: "match score, with reasons" },
  },
  {
    icon: MailCheck,
    title: "Warm Intros",
    body: "Draft padho, Gmail connect karo, approve karo. Message tumhare naam se, tumhare inbox se jaata hai.",
    punch: "Tumhara naam, tumhara inbox, tumhara style.",
    tone: "chai",
    stat: { value: "100%", label: "candidate-approved sends" },
  },
  {
    icon: Map,
    title: "Skill Roadmaps",
    body: "Tumhare aur role ke beech gap hai? Hireschema AI ek ghanta-roz ka learning plan bana deta hai.",
    punch: "Tumse na ho payega? Ho jayega — plan ready hai.",
    tone: "accent",
    stat: { value: "1 hr/day", label: "realistic plan" },
  },
  {
    icon: TrendingUp,
    title: "Career Intelligence",
    body: "AI batata hai tumhari asli market value — guesswork nahi, live openings ke data se.",
    punch: "Aaj khush toh bahut hoge tum? Ab number bhi dekh lo.",
    tone: "masala",
    stat: { value: "INR + USD", label: "comp benchmarks" },
  },
];

/*
 * Deliberately one colour for every card. Colour-coding each feature meant
 * four different rules stacked up as you scrolled, which read as a pile of
 * stripes instead of a deck of cards.
 */
const TONE = {
  accent: { text: "text-accent", border: "border-accent", rule: "bg-accent" },
  masala: { text: "text-accent", border: "border-accent", rule: "bg-accent" },
  volt:   { text: "text-accent", border: "border-accent", rule: "bg-accent" },
  chai:   { text: "text-accent", border: "border-accent", rule: "bg-accent" },
} as const;

export function Features() {
  return (
    <section id="features" className="relative">
      <div className="mx-auto max-w-page px-6 pb-8 pt-28 text-center">
        <span className="eyebrow mb-6">Features</span>
        <h2 className="text-h1 font-display">
          <span className="text-gradient">Parampara, Pratishtha,</span>{" "}
          <span className="text-gradient-accent">aur Remote Jobs.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-prose text-lead text-ink-500">
          Recruiter, coach aur strategist — teeno ek jagah. Aisa koi kaam nahi
          jo Hireschema ne nahi kiya ho.
        </p>
      </div>

      <div className="mx-auto max-w-page px-6 pb-32">
        {FEATURES.map((feature, i) => (
          <DeckCard
            key={feature.title}
            feature={feature}
            index={i}
            total={FEATURES.length}
          />
        ))}
      </div>
    </section>
  );
}

function DeckCard({
  feature,
  index,
  total,
}: {
  feature: Feature;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const tone = TONE[feature.tone];
  const Icon = feature.icon;

  // Progress of *this* card from the moment it sticks to the end of the deck.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 120px", "end 60px"],
  });

  // Cards further down the deck shrink less — the last one never shrinks.
  const remaining = (total - 1 - index) / total;
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 - remaining * 0.14]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 1 - remaining * 0.75]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, index % 2 === 0 ? -1.6 : 1.6]);

  return (
    <div
      ref={ref}
      className="sticky mb-5"
      style={{ top: `${100 + index * 10}px` }}
    >
      <motion.article
        style={
          reduced
            ? undefined
            : { scale, opacity, rotate, transformOrigin: "center top" }
        }
        className={cn(
          "glass-solid relative overflow-hidden rounded-3xl edge-light will-transform",
        )}
      >
        {/* Tone rule — colour coding without a blob. */}
        <div aria-hidden className={cn("absolute inset-x-0 top-0 h-[3px]", tone.rule)} />

        <div className="relative grid gap-6 p-6 sm:p-7 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8">
          {/* Icon + index */}
          <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-6">
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center border bg-paper-0/60",
                tone.border,
              )}
            >
              <Icon className={cn("h-5 w-5", tone.text)} strokeWidth={1.8} />
            </span>
            <span className="font-mono text-micro uppercase text-ink-400">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>

          {/* Copy */}
          <div>
            <h3 className="mb-2.5 font-display text-h3 text-ink-900">
              {feature.title}
            </h3>
            <p className="mb-4 max-w-prose text-small text-ink-500">
              {feature.body}
            </p>
            <p
              className="
                font-display text-[clamp(0.95rem,1.8vw,1.2rem)] font-extrabold
                leading-snug text-[#FFE45E]
                [text-shadow:0_2px_0_#000,0_-2px_0_#000,2px_0_0_#000,-2px_0_0_#000]
              "
            >
              {feature.punch}
            </p>
          </div>

          {/* Stat */}
          <div
            className={cn(
              "border bg-paper-0/60 px-5 py-4 text-center md:min-w-[150px]",
              tone.border,
            )}
          >
            <p className={cn("font-display text-h2 font-extrabold leading-none", tone.text)}>
              {feature.stat.value}
            </p>
            <p className="mt-1.5 text-[12px] text-ink-500">{feature.stat.label}</p>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
