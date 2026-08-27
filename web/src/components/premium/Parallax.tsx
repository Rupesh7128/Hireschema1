"use client";

/**
 * Small scroll utilities shared by the sections.
 */

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

/** Depth parallax. Negative speed moves against the scroll (reads as nearer). */
export function Parallax({
  children,
  speed = 0.2,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${speed * -100}%`]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }} className="will-transform">
        {children}
      </motion.div>
    </div>
  );
}

/**
 * A block that arrives as though it were lying flat on a table and standing up
 * — rotateX plus a scale, driven by its own position in the viewport.
 */
export function StandUp({
  children,
  className,
  from = 26,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.45"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.5 });
  const rotateX = useTransform(p, [0, 1], [from, 0]);
  const scale = useTransform(p, [0, 1], [0.9, 1]);
  const opacity = useTransform(p, [0, 0.5], [0, 1]);
  const y = useTransform(p, [0, 1], [70, 0]);

  return (
    <div ref={ref} className={cn("perspective-far", className)}>
      <motion.div
        style={
          reduced
            ? undefined
            : { rotateX, scale, opacity, y, transformStyle: "preserve-3d" }
        }
        className="will-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Text whose words light up one by one as the block crosses the viewport. */
export function ScrollHighlightText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });
  const words = text.split(" ");

  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => (
        <HighlightWord
          key={`${word}-${i}`}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1.6) / words.length]}
        >
          {word}
        </HighlightWord>
      ))}
    </p>
  );
}

function HighlightWord({
  children,
  progress,
  range,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <span className="relative mr-[0.28em] mt-[0.12em]">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}
