"use client";

/**
 * The signature transition: a single word grows until the camera passes
 * *through* it, and the next scene is revealed inside the hole it leaves.
 *
 * How it works:
 *  - A tall spacer (default 320vh) gives the move room to breathe.
 *  - Inside it, a sticky 100vh stage.
 *  - The word is painted as an SVG mask: filled rect, word knocked out. As the
 *    mask scales up, the knockout grows until it covers the viewport — so you
 *    are literally looking through the letterforms at the layer behind.
 *  - `behind` sits under the mask and eases from far away to resting size.
 *
 * Reduced motion collapses the whole thing to a static title card.
 */

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

type ZoomThroughProps = {
  /** The word the camera flies through. Short words read best — 4–9 chars. */
  word: string;
  /** Line above the word. */
  kicker?: string;
  /** Line below the word. */
  sub?: string;
  /** Scene revealed through the letterforms. */
  behind: ReactNode;
  /** Scroll distance for the move. */
  height?: string;
  className?: string;
};

export function ZoomThrough({
  word,
  kicker,
  sub,
  behind,
  height = "320vh",
  className,
}: ZoomThroughProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The knockout mask: gentle approach, then a hard acceleration through.
  const maskScale = useTransform(scrollYProgress, [0, 0.55, 1], [1, 4.5, 46]);
  const maskOpacity = useTransform(scrollYProgress, [0, 0.82, 0.97], [1, 1, 0]);

  // The scene behind starts pushed back and settles as you arrive. It has to
  // be present from the very first frame, otherwise the knockout is black on
  // black and the word is invisible until you have already scrolled past it.
  const behindScale = useTransform(scrollYProgress, [0, 0.6, 1], [1.5, 1.2, 1]);
  const behindOpacity = useTransform(scrollYProgress, [0, 0.35], [0, 1]);
  const behindBlur = useTransform(scrollYProgress, [0, 0.5], [9, 0]);
  const behindFilter = useTransform(behindBlur, (b) => `blur(${b}px)`);

  // A lit plate directly behind the aperture, so the letterforms read as
  // glowing type at rest and hand off to the real scene as you fly in.
  const plateOpacity = useTransform(scrollYProgress, [0, 0.42], [1, 0]);

  // Supporting lines peel away early so the word owns the frame.
  const labelOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);
  const labelY = useTransform(scrollYProgress, [0, 0.3], [0, -70]);

  if (reduced) {
    return (
      <div className={className}>
        <div className="mx-auto max-w-page px-6 py-24 text-center">
          {kicker && <p className="eyebrow mb-6">{kicker}</p>}
          <h2 className="text-display text-gradient-accent">{word}</h2>
          {sub && <p className="mt-6 text-lead text-ink-500">{sub}</p>}
        </div>
        {behind}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ height }} className={cn("relative", className)}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-paper-0">
        {/* Layer 0 — the lit plate the word glows against. */}
        <motion.div
          aria-hidden
          style={{ opacity: plateOpacity }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,#B4F58A_0%,#9FE870_22%,#FFB020_52%,#FF6B4A_74%,#2A1206_100%)]" />
          <div className="absolute inset-0 bg-grid-sm opacity-20" />
        </motion.div>

        {/* Layer 1 — the destination scene. */}
        <motion.div
          style={{
            scale: behindScale,
            opacity: behindOpacity,
            filter: behindFilter,
          }}
          className="absolute inset-0 will-transform"
        >
          {behind}
        </motion.div>

        {/* Layer 2 — the charcoal curtain with the word knocked out of it. */}
        <motion.div
          aria-hidden
          style={{ opacity: maskOpacity }}
          className="absolute inset-0"
        >
          <motion.div
            style={{ scale: maskScale }}
            className="absolute inset-0 will-transform"
          >
            <svg
              className="h-full w-full"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <mask id={`zoom-${word}`}>
                  <rect width="1000" height="1000" fill="white" />
                  <text
                    x="500"
                    y="500"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="black"
                    style={{
                      fontFamily: "var(--font-display), sans-serif",
                      fontWeight: 800,
                      fontSize: word.length > 7 ? 132 : 186,
                      letterSpacing: "-0.045em",
                    }}
                  >
                    {word}
                  </text>
                </mask>
              </defs>
              <rect
                width="1000"
                height="1000"
                fill="#0A0A0B"
                mask={`url(#zoom-${word})`}
              />
            </svg>
          </motion.div>

          {/* Rim light around the aperture. */}
          <motion.div
            style={{ opacity: labelOpacity }}
            className="pointer-events-none absolute inset-0"
          >
            <div className="pool-accent absolute left-1/2 top-1/2 h-[46vh] w-[76vw] -translate-x-1/2 -translate-y-1/2" />
          </motion.div>
        </motion.div>

        {/* Layer 3 — kicker + sub, above the curtain, gone by the time you pass through. */}
        <motion.div
          style={{ opacity: labelOpacity, y: labelY }}
          className="pointer-events-none absolute inset-x-0 top-0 flex h-full flex-col items-center justify-between py-[14vh]"
        >
          {kicker ? (
            <span className="eyebrow bg-paper-0/70">{kicker}</span>
          ) : (
            <span />
          )}
          {sub ? (
            <p className="max-w-prose px-6 text-center text-lead text-ink-500">
              {sub}
            </p>
          ) : (
            <span />
          )}
        </motion.div>
      </div>
    </div>
  );
}
