"use client";

/**
 * Section transition: the word tears in half and the two halves slide apart,
 * opening like doors onto the scene behind.
 *
 * Deliberately a different mechanic from <ZoomThrough/>. Two scale-zooms in
 * one page read as the same trick twice; this one moves on a different axis
 * and has a different beat.
 *
 * Both halves are the same text, clipped top and bottom with `clip-path`, so
 * the tear lands exactly on the glyph mid-line at any font size. Everything
 * animates on transform and opacity only.
 */

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

type SplitRevealProps = {
  word: string;
  kicker?: string;
  sub?: string;
  behind: ReactNode;
  height?: string;
  className?: string;
};

export function SplitReveal({
  word,
  kicker,
  sub,
  behind,
  height = "230vh",
  className,
}: SplitRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The halves hold, then part.
  const topY = useTransform(scrollYProgress, [0.12, 0.8], ["0%", "-165%"]);
  const bottomY = useTransform(scrollYProgress, [0.12, 0.8], ["0%", "165%"]);
  // A slight counter-rotation as they leave makes the tear feel physical.
  const topRot = useTransform(scrollYProgress, [0.12, 0.8], [0, -4]);
  const bottomRot = useTransform(scrollYProgress, [0.12, 0.8], [0, 4]);
  const wordOpacity = useTransform(scrollYProgress, [0.6, 0.85], [1, 0]);

  // The curtain fades as the gap between the halves widens.
  const curtainOpacity = useTransform(scrollYProgress, [0.15, 0.62], [1, 0]);
  const behindScale = useTransform(scrollYProgress, [0.15, 1], [1.1, 1]);

  const labelOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const labelY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  const len = word.length;
  const sizeClass =
    len > 11
      ? "text-[clamp(2rem,13vw,9rem)]"
      : len > 8
        ? "text-[clamp(2.75rem,18vw,13rem)]"
        : "text-[clamp(3.5rem,26vw,19rem)]";

  const typeClass = cn(
    `select-none whitespace-nowrap font-display font-extrabold
     leading-none tracking-[-0.045em] text-gradient-accent-static`,
    sizeClass,
  );

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
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-paper-0 [isolation:isolate]">
        {/* Layer 1 — destination scene. */}
        <motion.div
          style={{ scale: behindScale }}
          className="absolute inset-0 z-0 will-transform"
        >
          {behind}
        </motion.div>

        {/* Layer 2 — the two halves of the word, on their own charcoal panels. */}
        <div aria-hidden className="absolute inset-0 z-10">
          <motion.div
            style={{ y: topY, rotate: topRot }}
            className="absolute inset-0 will-transform"
          >
            <motion.div
              style={{ opacity: curtainOpacity }}
              className="absolute inset-x-0 top-0 h-1/2 bg-paper-0"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                style={{ opacity: wordOpacity, clipPath: "inset(0 0 50% 0)" }}
                className={typeClass}
              >
                {word}
              </motion.span>
            </div>
          </motion.div>

          <motion.div
            style={{ y: bottomY, rotate: bottomRot }}
            className="absolute inset-0 will-transform"
          >
            <motion.div
              style={{ opacity: curtainOpacity }}
              className="absolute inset-x-0 bottom-0 h-1/2 bg-paper-0"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                style={{ opacity: wordOpacity, clipPath: "inset(50% 0 0 0)" }}
                className={typeClass}
              >
                {word}
              </motion.span>
            </div>
          </motion.div>

          {/* The seam that glows as the tear opens. */}
          <motion.div
            style={{ opacity: curtainOpacity }}
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-accent/70 to-transparent"
          />
        </div>

        {/* Layer 3 — kicker + sub. */}
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
