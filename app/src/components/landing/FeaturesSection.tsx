"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Briefcase,
  FileText,
  GraduationCap,
  MessageSquare,
  Send,
} from "@/components/brand/icons";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { RevealStagger, StaggerItem } from "@/components/ui/motion";

type Feature = { Icon: LucideIcon; title: string; body: string };

const CANDIDATE_FEATURES: Feature[] = [
  {
    Icon: FileText,
    title: "Free CV review",
    body: "Upload your résumé for an elite recruiter scorecard — impact, clarity, ATS, and India fit — then unlock matched roles when you join.",
  },
  {
    Icon: MessageSquare,
    title: "One chat with Hireschema AI",
    body: "Ask for roles, compare matches, and prepare applications without learning a complicated workflow.",
  },
  {
    Icon: Briefcase,
    title: "Real roles, scored",
    body: "Hireschema AI finds live openings in your region — ranked by fit, not keyword spam.",
  },
  {
    Icon: Send,
    title: "Warm intros",
    body: "Review the draft, connect Gmail, and approve the message before Hireschema AI sends it.",
  },
  {
    Icon: GraduationCap,
    title: "Skill roadmaps",
    body: "Gap between you and a role? Hireschema AI builds an hour-a-day learning plan.",
  },
  {
    Icon: Brain,
    title: "Career intelligence",
    body: "Hireschema AI shows your market value and next move — tied to actual openings.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-t border-ink-100 bg-paper-1"
    >
      <div className="mx-auto max-w-page px-6 py-16 md:py-24">
        <SectionHeader
          label="What Hireschema AI does"
          title="Your recruiter, coach, and strategist."
          description="Search, matching, application preparation, and career guidance — with you in control."
        />

        <RevealStagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CANDIDATE_FEATURES.map(({ Icon, title, body }) => (
            <StaggerItem key={title}>
              <motion.div
                className="group h-full space-y-3 rounded-xl border border-ink-100 bg-paper-0 p-6"
                whileHover={{ y: -4, borderColor: "rgba(185,248,76,0.35)" }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
              >
                <motion.span
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"
                  whileHover={{ scale: 1.08, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </motion.span>
                <h3 className="text-h3 text-ink-900">{title}</h3>
                <p className="text-small leading-relaxed text-ink-600">
                  {body}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
