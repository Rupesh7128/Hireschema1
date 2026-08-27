"use client";

/**
 * A CTA that leans toward the cursor before you reach it. The label counter-
 * moves slightly, which is what makes it feel attached rather than sliding.
 */

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "accent" | "ghost" | "masala";
  className?: string;
  /** Pull radius in px, as a fraction of travel. */
  strength?: number;
};

/** Hoisted: creating this inside the component remounts the link every render. */
const MotionLink = motion.create(Link);

const VARIANTS = {
  accent:
    "bg-accent text-accent-fg shadow-[0_10px_40px_-12px_rgba(159,232,112,0.8)] hover:shadow-[0_16px_60px_-12px_rgba(159,232,112,0.95)]",
  masala:
    "bg-masala text-accent-fg shadow-[0_10px_40px_-12px_rgba(255,176,32,0.8)] hover:shadow-[0_16px_60px_-12px_rgba(255,176,32,0.95)]",
  ghost:
    "glass text-ink-900 hover:border-accent/40 hover:text-accent",
} as const;

export function MagneticButton({
  href,
  children,
  variant = "accent",
  className,
  strength = 0.35,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 250, damping: 18, mass: 0.5 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  const labelX = useTransform(sx, (v) => v * -0.25);
  const labelY = useTransform(sy, (v) => v * -0.25);

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <MotionLink
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        `group relative inline-flex h-[52px] items-center justify-center gap-2
         overflow-hidden rounded-full px-7 text-[15px] font-semibold
         transition-shadow duration-base will-transform`,
        VARIANTS[variant],
        className,
      )}
    >
      {/* Sheen wipe on hover. */}
      <span
        aria-hidden
        className="
          absolute inset-0 -translate-x-full bg-gradient-to-r
          from-transparent via-white/35 to-transparent
          transition-transform duration-slower ease-out-soft
          group-hover:translate-x-full
        "
      />
      <motion.span style={{ x: labelX, y: labelY }} className="relative flex items-center gap-2">
        {children}
      </motion.span>
    </MotionLink>
  );
}
