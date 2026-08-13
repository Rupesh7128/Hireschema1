"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FileText,
  MapPin,
  MessageSquare,
  Mic,
  Search,
  Send,
  Sparkles,
  Zap,
} from "@/components/brand/icons";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { LANDING_AGENT } from "@/components/landing/landing-audience";
import { RevealStagger, StaggerItem } from "@/components/ui/motion";

type Step = {
  step: string;
  Icon: LucideIcon;
  title: string;
  body: string;
  detail: string;
};

const CANDIDATE_STEPS: Step[] = [
  {
    step: "01",
    Icon: MessageSquare,
    title: "Tell Hireschema AI what you want",
    body: "Upload your CV, then tell Hireschema AI the role, city, and salary range you want. You can type or talk, and you can correct the profile she extracts.",
    detail: "Hireschema AI · voice or text",
  },
  {
    step: "02",
    Icon: Search,
    title: "Hireschema AI finds India-eligible roles",
    body: "Hireschema AI searches active roles in India, including remote roles that accept candidates in India, using your preferences to narrow the results.",
    detail: "India onsite · India-eligible remote",
  },
  {
    step: "03",
    Icon: Briefcase,
    title: "Hireschema AI scores every role",
    body: "Real jobs, ranked by genuine match — skills, seniority, location, and comp. You see why each role fits and what to improve.",
    detail: "Transparent scoring · Skill gaps",
  },
  {
    step: "04",
    Icon: Send,
    title: "Hireschema AI requests warm intros",
    body: "Pick a role you like. Hireschema AI prepares a tailored CV and intro draft. You review and approve the message before it is sent from your Gmail.",
    detail: "Candidate-approved · Sent from your Gmail",
  },
];

export function ProcessSection() {
  const steps = CANDIDATE_STEPS;
  const agent = LANDING_AGENT;

  return (
    <section
      id="process"
      className="scroll-mt-20 border-t border-ink-100 bg-paper-0"
    >
      <div className="mx-auto max-w-page px-6 py-16 md:py-24">
        <SectionHeader
          label="How Hireschema AI works"
          title="From CV to a reviewed introduction."
          description="Hireschema AI does the search and preparation. You decide what is accurate and what gets sent."
        />

        <div className="relative mt-14">
          <div
            className="absolute left-[27px] top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-accent/60 via-ink-200 to-transparent md:block"
            aria-hidden
          />

          <RevealStagger className="space-y-6">
            {steps.map(({ step, Icon, title, body, detail }, i) => (
              <StaggerItem key={step}>
                <motion.article
                  className="group relative grid gap-4 rounded-xl border border-ink-100 bg-paper-1 p-6 transition-colors hover:border-ink-300 md:grid-cols-[auto_1fr] md:gap-6"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  <div className="flex items-start gap-4 md:flex-col md:items-center md:gap-3">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ink-900 ring-2 ring-accent/20">
                      <Icon
                        className="h-6 w-6 text-paper-0"
                        strokeWidth={1.5}
                      />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded bg-accent text-[10px] font-bold text-on-accent">
                        {step.replace("0", "")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-h3 text-ink-900">{title}</h3>
                      <span className="text-micro text-ink-400">
                        {agent.name} · Step {step}
                      </span>
                    </div>
                    <p className="text-small leading-relaxed text-ink-600">
                      {body}
                    </p>
                    <p className="inline-flex items-center gap-1.5 text-micro font-medium text-accent">
                      <Sparkles className="h-3 w-3" strokeWidth={1.5} />
                      {detail}
                    </p>
                  </div>

                  {i < steps.length - 1 ? (
                    <motion.div
                      className="absolute -bottom-3 left-7 hidden h-6 w-6 items-center justify-center rounded-full bg-paper-0 ring-1 ring-ink-100 md:flex"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
                      aria-hidden
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    </motion.div>
                  ) : null}
                </motion.article>
              </StaggerItem>
            ))}
          </RevealStagger>
        </div>
      </div>
    </section>
  );
}

const CREDIBILITY: { Icon: LucideIcon; label: string; sub: string }[] = [
  { Icon: Mic, label: "Talk to Hireschema AI", sub: "Text or voice" },
  { Icon: MapPin, label: "India-focused", sub: "Onsite and eligible remote" },
  { Icon: Zap, label: "Live actions", sub: "Every step logged" },
  { Icon: FileText, label: "CV per role", sub: "Hireschema AI tailors each one" },
];

export function CredibilityBar() {
  const items = CREDIBILITY;

  return (
    <section className="border-y border-ink-100 bg-paper-1">
      <RevealStagger className="mx-auto grid max-w-page grid-cols-2 gap-6 px-6 py-8 md:grid-cols-4">
        {items.map(({ Icon, label, sub }) => (
          <StaggerItem key={label}>
            <motion.div
              className="flex items-start gap-3"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-small font-semibold text-ink-900">{label}</p>
                <p className="text-micro text-ink-500">{sub}</p>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </RevealStagger>
    </section>
  );
}
