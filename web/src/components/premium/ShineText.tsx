"use client";

/**
 * Outlined text with a highlight that sweeps across it on a loop.
 *
 * Two implementation notes, both learned the hard way:
 *
 * 1. The sweep is a `clip-path`, not an animated `background-position` under
 *    `background-clip: text`. The latter does not repaint — the animation
 *    reports `running` and its currentTime advances, but the rendered pixels
 *    are identical at any two phases. Verified by pinning opposite phases and
 *    diffing frames.
 *
 * 2. Colour lives in the stroke only, never the fill, and there is no glow
 *    filter. A `drop-shadow` on stroked text at this size bleeds into the
 *    counters, so the letters read as filled instead of outlined.
 *
 * The gradient falloff comes from three bands travelling together: wide and
 * faint, through medium, to a narrow bright core.
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * Class names are written out in full on purpose. Building them with a
 * template literal (`shine-over--${key}`) means Tailwind's content scanner
 * never sees the literal string, so it tree-shakes the rules out of the
 * production CSS and the animation silently never registers.
 */
const BANDS = [
  "shine-over--wide animate-shine-wide",
  "shine-over--mid animate-shine-mid",
  "shine-over--core animate-shine-core",
] as const;

export function ShineText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  /** Seconds before the entrance reveal starts. */
  delay?: number;
}) {
  return (
    <motion.span
      initial={{ y: "110%", opacity: 0, rotateX: -75 }}
      whileInView={{ y: "0%", opacity: 1, rotateX: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn("relative inline-block", className)}
    >
      <span className="shine-base">{text}</span>

      {BANDS.map((band) => (
        <span key={band} aria-hidden className={cn("shine-over", band)}>
          {text}
        </span>
      ))}
    </motion.span>
  );
}
