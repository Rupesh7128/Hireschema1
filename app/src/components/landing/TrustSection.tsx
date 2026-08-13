"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
} from "@/components/brand/icons";
import { LANDING_AGENT } from "@/components/landing/landing-audience";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/motion";
import { BTN_PRIMARY } from "@/lib/button-classes";
import { cn } from "@/lib/utils";

export function TrustSection() {
  const points = [
    {
      Icon: Zap,
      title: "See every action",
      body: 'Hireschema AI logs every search, score, and outreach. "Hireschema AI performed 7 actions on your profile" — always visible.',
    },
    {
      Icon: ShieldCheck,
      title: "Consent-first",
      body: "Recruiter discovery is off until you opt in. Public profile publishing is a separate choice, and you can turn either one off.",
    },
  ] as const;

  return (
    <section id="trust" className="scroll-mt-20">
      <div className="mx-auto max-w-page px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <SectionHeader
            label={`Trust ${LANDING_AGENT.name}`}
            title="Clear actions. Clear consent."
            description={`${LANDING_AGENT.name} shows the work and leaves the important decisions with you.`}
          />

          <RevealStagger className="space-y-4">
            {points.map(({ Icon, title, body }) => (
              <StaggerItem key={title}>
                <motion.div
                  className="flex gap-4 rounded-xl border border-ink-100 bg-paper-1 p-5"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-h3 text-ink-900">{title}</h3>
                    <p className="text-small leading-relaxed text-ink-600">
                      {body}
                    </p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </RevealStagger>
        </div>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-ink-100 bg-ink-900">
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(185,248,76,0.15), transparent 50%), radial-gradient(circle at 80% 50%, rgba(185,248,76,0.08), transparent 40%)",
          backgroundSize: "200% 200%",
        }}
      />

      <div className="relative mx-auto max-w-page px-6 py-20 text-center">
        <Reveal>
          <h2 className="text-h1 text-paper-0 md:text-[32px]">
            Try Hireschema with Hireschema AI.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-body text-ink-500">
            Hireschema is invite-only for candidates in India. Request access
            and help shape consent-first hiring.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/invite"
              className={cn(BTN_PRIMARY, "group gap-2 px-8 py-3.5 text-body")}
            >
              Request an invite
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
            <span className="text-micro text-ink-400">
              Beta · Free to start · No credit card
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-ink-100">
      <div className="mx-auto flex max-w-page flex-col items-center justify-between gap-4 px-6 py-8 text-micro text-ink-400 sm:flex-row">
        <span>© {new Date().getFullYear()} Hireschema · Beta</span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="#process" className="transition-colors hover:text-ink-700">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-ink-700">
            Features
          </a>
          <Link href="/reviewmycv" className="transition-colors hover:text-ink-700">
            Review my CV
          </Link>
          <Link href="/invite" className="transition-colors hover:text-ink-700">
            Request invite
          </Link>
          <Link href="/signup?mode=signin" className="transition-colors hover:text-ink-700">
            Sign in
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:text-ink-700"
          >
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-ink-700">
            Terms of Service
          </Link>
          <a
            href="mailto:privacy@hireschema.com"
            className="transition-colors hover:text-ink-700"
          >
            Privacy contact
          </a>
        </div>
      </div>
    </footer>
  );
}
