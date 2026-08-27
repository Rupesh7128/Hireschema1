"use client";

/**
 * Pricing — one card.
 *
 * There used to be a "Free" tier card beside this one, which was misleading:
 * the platform is not free, the *invite request* is. That distinction now sits
 * in the copy rather than being sold as a plan.
 */

import { ArrowRight, Check, Clock } from "@/components/brand/icons";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { MemePopover } from "@/components/premium/MemePopover";
import { MemeGif } from "@/components/premium/MemeGif";
import { StandUp } from "@/components/premium/Parallax";
import { INVITE_URL } from "@/lib/site";

const INCLUDED = [
  "Sirf fully remote roles — Indian companies aur worldwide teams",
  "Har role ka match score, wajah ke saath",
  "Tailored CV aur intro draft, har role ke liye",
  "Intros seedha tere Gmail se — tu approve karega tab",
  "Skill roadmaps aur comp benchmarks (INR + USD)",
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
          <span className="text-gradient-accent">Nahi — ₹500 mahina, lunga, launch pe.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-prose text-lead text-ink-500">
          Product paid hai. Beta ke dauraan invite maangna free hai — approve
          hone ke baad tu poora product bina kisi charge ke chala sakta hai, jab
          tak hum launch nahi karte.
        </p>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-page gap-8 px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)] md:items-center">
        <StandUp>
          <article className="glass-strong relative overflow-hidden p-9 edge-light shadow-block-accent">
            <div
              aria-hidden
              className="pool-accent pointer-events-none absolute -right-20 -top-20 h-64 w-64"
            />
            <div className="relative">
              <span className="inline-flex items-center gap-2 border border-ink-200 bg-ink-50 px-3 py-1.5 text-micro uppercase text-ink-500">
                <Clock className="h-3 w-3" strokeWidth={2.4} />
                Launch pe
              </span>

              <div className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-2">
                <p className="font-display text-mega leading-none text-gradient-accent pr-[0.08em]">
                  ₹500
                </p>
                <p className="font-sans text-lead font-normal text-ink-400">
                  / month
                </p>
              </div>

              <ul className="mt-8 grid gap-3.5 sm:grid-cols-2">
                {INCLUDED.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-body text-ink-600">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={2.6} />
                    {p}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <MemePopover gif="thankYouFrands">
                  <MagneticButton href={INVITE_URL}>
                    Request an invite — free
                    <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                  </MagneticButton>
                </MemePopover>
                <p className="text-small text-ink-400">
                  Checkout abhi live nahi hai. Card ki zaroorat nahi.
                </p>
              </div>
            </div>
          </article>
        </StandUp>

        <StandUp>
          <MemeGif name="raviCelebrate" className="w-full shadow-block" />
        </StandUp>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative mx-auto mt-10 max-w-prose px-6 text-center text-small text-ink-400"
      >
        Beta users ko launch ke baad grandfathered pricing milegi.
      </motion.p>
    </section>
  );
}
