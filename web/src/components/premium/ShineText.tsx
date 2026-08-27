"use client";

/**
 * Outlined text with a highlight that sweeps across it on a loop.
 *
 * Implementation note — the obvious approach is `background-clip: text` with
 * an animated `background-position`. That does not repaint: the animation
 * object reports `running` and its currentTime advances, but the rendered
 * pixels are identical at any two phases. Verified by pinning the animation
 * to opposite phases and diffing the frames.
 *
 * So the text is drawn twice instead. The base layer is the outline; a bright
 * copy sits exactly on top and is revealed through a `clip-path` band that
 * travels across. clip-path animation repaints reliably.
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
      {/* Base — the outline itself. */}
      <span className="shine-base">{text}</span>

      {/* Overlay — the lit copy, revealed through the travelling band. */}
      <span aria-hidden className="shine-over">
        {text}
      </span>
    </motion.span>
  );
}
