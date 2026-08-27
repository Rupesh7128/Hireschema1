"use client";

/**
 * Pricing — two tilt cards, one live, one queued.
 * The free tier is the hero; the launch price is shown so nobody feels
 * bait-and-switched later.
 */

import { ArrowRight, Check, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { MemePopover } from "@/components/premium/MemePopover";
import { MemeGif } from "@/components/premium/MemeGif";
import { TiltCard } from "@/components/premium/TiltCard";
import { StandUp } from "@/components/premium/Parallax";
import { INVITE_URL } from "@/lib/site";

const NOW_POINTS = [
  "Invite maango, approval ke baad andar",
  "Remote matches jo India se ho sakti hain",
  "Indian companies + worldwide teams",
  "Free CV scorecard",
  "Zero cost. No card, no Razorpay.",
];

const LAUNCH_POINTS = [
  "Wahi product: sirf fully remote roles",
  "Salaries INR aur USD dono",
  "Intros seedha tumhare Gmail se",
  "Skill roadmaps + career intelligence",
  "Checkout abhi live nahi hai",
];

export function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="pool-accent absolute left-1/2 top-1/4 h-[50vh] w-[70vw] -translate-x-1/2 opacity-60" />
      </div>

      <div className="relative mx-auto max-w-page px-6 text-center">
        <span className="eyebrow mb-6">Pricing</span>
        <h2 className="text-h1 font-display">
          <span className="text-gradient">&ldquo;Dedh sau rupiya dega?&rdquo;</span>
          <br />
          <span className="text-gradient-accent">Nahi — ₹500 a month, jab launch honge.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-prose text-lead text-ink-500">
          Abhi? Beta chal raha hai. Invite-only access aaj bilkul{" "}
          <span className="font-semibold text-accent">free</span> hai. No credit
          card, no Razorpay. Bete, mauj kardi.
        </p>
      </div>

      <div className="relative mx-auto mt-10 flex max-w-page justify-center px-6">
        <MemeGif name="mastPlan" className="w-[240px] -rotate-2 shadow-3" />
      </div>

      <div className="relative mx-auto mt-12 grid max-w-page gap-6 px-6 md:grid-cols-2">
        {/* NOW — free */}
        <StandUp>
          <TiltCard intensity={6} lift={22}>
            <article className="glass-strong relative h-full overflow-hidden rounded-3xl p-9 edge-light shadow-[0_50px_140px_-50px_rgba(159,232,112,0.8)]">
              <div
                aria-hidden
                className="pool-accent pointer-events-none absolute -right-20 -top-20 h-64 w-64"
              />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-3 py-1.5 text-micro uppercase text-accent">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  Abhi · Invite only
                </span>

                <p className="mt-7 font-display text-mega leading-none text-gradient-accent">
                  Free
                </p>
                <p className="mt-3 text-body text-ink-500">
                  Main gareeb hoon? No worries. Invite maango, approve hone ke
                  baad poora product khul jaata hai.
                </p>

                <ul className="mt-8 space-y-3.5">
                  {NOW_POINTS.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-body text-ink-600">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={2.6} />
                      {p}
                    </li>
                  ))}
                </ul>

                <div className="mt-9">
                  <MemePopover gif="hoHoHo" className="w-full">
                    <MagneticButton href={INVITE_URL} className="w-full">
                      Request invite — free hai
                      <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                    </MagneticButton>
                  </MemePopover>
                </div>
              </div>
            </article>
          </TiltCard>
        </StandUp>

        {/* AT LAUNCH — ₹500 */}
        <StandUp>
          <TiltCard intensity={6} lift={16}>
            <article className="glass relative h-full overflow-hidden rounded-3xl p-9 edge-light">
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50/70 px-3 py-1.5 text-micro uppercase text-ink-500">
                  <Clock className="h-3 w-3" strokeWidth={2.4} />
                  Launch pe
                </span>

                <p className="mt-7 font-display text-mega leading-none text-ink-700">
                  ₹500
                  <span className="ml-2 align-middle font-sans text-lead font-normal text-ink-400">
                    / month
                  </span>
                </p>
                <p className="mt-3 text-body text-ink-500">
                  Ek kaam kar — ₹500 de, aur baaki portals ki overacting kaat.
                </p>

                <ul className="mt-8 space-y-3.5">
                  {LAUNCH_POINTS.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-body text-ink-500">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-ink-400" strokeWidth={2.6} />
                      {p}
                    </li>
                  ))}
                </ul>

                <div className="mt-9 flex h-[52px] items-center justify-center rounded-full border border-dashed border-ink-300 text-small text-ink-400">
                  Checkout abhi live nahi hai
                </div>
              </div>
            </article>
          </TiltCard>
        </StandUp>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative mx-auto mt-10 max-w-prose px-6 text-center text-small text-ink-400"
      >
        Beta users ko launch ke baad bhi grandfathered pricing milegi. Promise
        hai, doglapan nahi.
      </motion.p>
    </section>
  );
}
