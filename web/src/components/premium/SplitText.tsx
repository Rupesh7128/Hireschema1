"use client";

/**
 * Per-word / per-character reveal that flips up from below the baseline in 3D.
 * Words are the default granularity — characters on a long line reads busy.
 */

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type SplitTextProps = {
  text: string;
  by?: "word" | "char";
  className?: string;
  /** Seconds between each unit. */
  stagger?: number;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  once?: boolean;
  /**
   * Applied to each animated unit rather than the wrapper.
   *
   * Needed for gradient text: each unit animates transform/opacity and so gets
   * its own compositing layer, which an ancestor's `background-clip: text`
   * cannot paint through. Put the gradient class here instead.
   */
  unitClassName?: string;
};

const container = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

const unit: Variants = {
  hidden: { y: "110%", opacity: 0, rotateX: -75 },
  show: {
    y: "0%",
    opacity: 1,
    rotateX: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
};

export function SplitText({
  text,
  by = "word",
  className,
  stagger = 0.045,
  delay = 0,
  as = "span",
  once = true,
  unitClassName,
}: SplitTextProps) {
  const Tag = motion[as] as typeof motion.span;
  const parts = by === "word" ? text.split(" ") : Array.from(text);

  return (
    <Tag
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.4 }}
      className={cn("inline-block perspective", className)}
      aria-label={text}
    >
      {parts.map((part, i) => (
        <span
          key={`${part}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden align-bottom"
        >
          <motion.span
            variants={unit}
            className={cn("inline-block will-transform", unitClassName)}
          >
            {part === " " ? " " : part}
            {by === "word" && i < parts.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
