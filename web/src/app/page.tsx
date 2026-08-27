/**
 * Hireschema landing — one continuous 3D scroll, written in Hinglish.
 *
 * Scene order matters more than section order. The page opens on a lit stage
 * with the product running, drops through HOME FROM WORK into the problem,
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
  title: "Hireschema — Money follows my brotha. Remote roles that fit.",
  description:
    "Hireschema AI tera CV padhta hai aur fully remote roles nikaalta hai jo tu India se kar sakta hai — Indian companies aur worldwide teams. Har intro tere Gmail se jaane se pehle tu khud review karta hai.",
};

export default function HomePage() {
  return (
    <main className="relative bg-paper-0">
      <Hero />

      {/* Camera falls through the word into the problem statement. */}
      <ZoomThrough
        word="HOME FROM WORK"
        kicker="Ye chahiye tha"
        sub="Aur abhi tak? 250 applications, ek bhi jawab nahi."
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
