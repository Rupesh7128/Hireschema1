"use client";

import "@/app/landing.css";
import { PremiumNavbar } from "@/components/landing/PremiumNavbar";
import { PremiumFooter } from "@/components/landing/PremiumFooter";
import { SmoothScroll } from "@/components/premium/SmoothScroll";
import { ScrollProgress } from "@/components/premium/ScrollProgress";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { Trust } from "@/components/sections/Trust";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCta } from "@/components/sections/FinalCta";
import { VoidScene, ScoreScene } from "@/components/sections/Interludes";
import { ZoomThrough } from "@/components/premium/ZoomThrough";
import { SplitReveal } from "@/components/premium/SplitReveal";

/**
 * Candidate landing — 3D Hinglish scroll. Nav/footer/Lenis stay on `/` only.
 */
export function LandingPage() {
  return (
    <div className="landing-root grain relative bg-paper-0">
      <SmoothScroll />
      <ScrollProgress />
      <PremiumNavbar />
      <main className="relative bg-paper-0">
        <Hero />

        <ZoomThrough
          word="HOME FROM WORK"
          kicker="Ye chahiye tha"
          sub="Aur abhi tak? 250 applications, ek bhi jawab nahi."
          behind={<VoidScene />}
        />

        <section id="how-it-works">
          <HowItWorks />
        </section>

        <SplitReveal
          word="AUKAT"
          kicker="Every role, scored"
          sub="Match score, aur uske peeche ki poori wajah."
          behind={<ScoreScene />}
          height="250vh"
        />

        <Features />
        <Trust />
        <Pricing />
        <FinalCta />
      </main>
      <PremiumFooter />
    </div>
  );
}
