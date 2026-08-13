"use client";

import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import {
  CredibilityBar,
  ProcessSection,
} from "@/components/landing/ProcessSection";
import {
  FinalCtaSection,
  LandingFooter,
  TrustSection,
} from "@/components/landing/TrustSection";

/**
 * Landing — candidate-only product story.
 */
export function LandingPage() {
  return (
    <main className="min-h-screen bg-paper-0">
      <LandingNav />
      <HeroSection />
      <CredibilityBar />
      <ProcessSection />
      <FeaturesSection />
      <TrustSection />
      <FinalCtaSection />
      <LandingFooter />
    </main>
  );
}
