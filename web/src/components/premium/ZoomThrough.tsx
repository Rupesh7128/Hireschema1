"use client";

/**
 * The section-to-section transition: a word grows until it fills the frame and
 * hands off to the scene behind it.
 *
 * Implementation note — this used to knock the word out of a charcoal curtain
 * with an SVG mask and scale that mask up 46×. It looked great in stills and
 * tore badly in motion: scaling an SVG mask forces the browser to re-rasterise
 * the mask every frame, and stacking a full-screen `filter: blur()` on top of
 * it meant the two layers composited out of sync during fast scrolls.
 *
 * Everything here is now transform + opacity only, which the compositor can
 * run on the GPU without repainting anything.
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
  /** The word the camera flies into. Short words read best — 4–9 chars. */
  word: string;
  /** Line above the word. */
  kicker?: string;
  /** Line below the word. */
  sub?: string;
  /** Scene the transition hands off to. */
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
  height = "230vh",
  className,
}: ZoomThroughProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The word is laid out at its *final* size and scaled DOWN to start, then
  // back up to 1. Scaling a glyph up from its rasterised size is what makes
  // text go soft and then visibly snap when the browser re-rasterises; scaling
  // down from a large raster stays sharp the whole way.
  const wordScale = useTransform(scrollYProgress, [0, 0.55, 1], [0.34, 0.85, 2.1]);
  const wordOpacity = useTransform(scrollYProgress, [0, 0.55, 0.85], [1, 1, 0]);

  // The destination settles into place as the word clears the frame.
  const behindScale = useTransform(scrollYProgress, [0.3, 1], [1.14, 1]);
  const behindOpacity = useTransform(scrollYProgress, [0.42, 0.78], [0, 1]);

  // Supporting lines peel away early so the word owns the frame.
  const labelOpacity = useTransform(scrollYProgress, [0, 0.24], [1, 0]);
  const labelY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

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
      {/* `isolate` keeps this stage's stacking order self-contained, so the
          hero above can never bleed into it mid-scroll. */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-paper-0 [isolation:isolate]">
        {/* Layer 1 — destination scene. */}
        <motion.div
          style={{ scale: behindScale, opacity: behindOpacity }}
          className="absolute inset-0 z-0 will-transform"
        >
          {behind}
        </motion.div>

        {/* Layer 2 — the word. */}
        <motion.div
          aria-hidden
          style={{ opacity: wordOpacity }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-paper-0"
        >
          <div className="pool-accent absolute left-1/2 top-1/2 h-[52vh] w-[80vw] -translate-x-1/2 -translate-y-1/2" />
          {/* No `will-change` here on purpose: promoting this to its own layer
              makes Chrome cache one texture and stretch it, which is exactly
              the artefact we are avoiding. */}
          <motion.span
            style={{ scale: wordScale }}
            className="
              relative select-none whitespace-nowrap px-6 text-center font-display
              text-[clamp(4rem,30vw,22rem)] font-extrabold leading-none
              tracking-[-0.05em] text-gradient-accent-static
            "
          >
            {word}
          </motion.span>
        </motion.div>

        {/* Layer 3 — kicker + sub, gone before the word takes over. */}
        <motion.div
          style={{ opacity: labelOpacity, y: labelY }}
          className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-full flex-col items-center justify-between py-[13vh]"
        >
          {kicker ? <span className="eyebrow bg-paper-0/80">{kicker}</span> : <span />}
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
