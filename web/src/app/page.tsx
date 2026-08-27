/**
 * Hireschema landing — one continuous 3D scroll, written in Hinglish.
 *
 * Scene order matters more than section order. The page opens on a lit stage
 * with the product running, drops through the word DOGLAPAN into the problem,
 * runs the product as a horizontal rail, falls through AUKAT into scoring,
 * stacks the features as a deck, then pulls back out to the grid it started
 * on. Every Hinglish line is attached to a claim — none of it is decoration.
 */

import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { Trust } from "@/components/sections/Trust";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCta } from "@/components/sections/FinalCta";
import { VoidScene, ScoreScene } from "@/components/sections/Interludes";
import { ZoomThrough } from "@/components/premium/ZoomThrough";

export const metadata = {
  title: "Hireschema — Money follows my brotha. Remote roles, bina doglapan ke.",
  description:
    "Hireschema AI tumhara CV padh ke US, Australia aur global teams ki fully remote jobs nikaalta hai — jo India se ho sakti hain. Har warm intro tum approve karte ho, tumhare Gmail se jaata hai.",
};

export default function HomePage() {
  return (
    <main className="relative bg-paper-0">
      <Hero />

      {/* Camera falls through the word into the problem statement. */}
      <ZoomThrough
        word="DOGLAPAN"
        kicker="Stop throwing CVs into the void"
        sub="Naukri portals ka sabse bada product: umeed. Aur uska refund nahi milta."
        behind={<VoidScene />}
      />

      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* …and again, into the scoring model. */}
      <ZoomThrough
        word="AUKAT"
        kicker="Every role, scored"
        sub="Match score, aur uske peeche ki poori wajah."
        behind={<ScoreScene />}
        height="280vh"
      />

      <Features />
      <Trust />
      <Pricing />
      <FinalCta />
    </main>
  );
}
