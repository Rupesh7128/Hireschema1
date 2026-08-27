"use client";

/**
 * A CTA that leans toward the cursor before you reach it. The label counter-
 * moves slightly, which is what makes it feel attached rather than sliding.
 */

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "accent" | "ghost" | "masala";
  className?: string;
};

/** Hoisted: creating this inside the component remounts the link every render. */
const MotionLink = motion.create(Link);

/*
 * Matches the live product: a hard black keyline with a coloured ring sitting
 * outside it. No radius, no soft glow.
 */
const VARIANTS = {
  accent: "btn-brutal bg-accent text-accent-fg hover:bg-accent-hover",
  masala: "btn-brutal bg-masala text-accent-fg hover:bg-masala-hover",
  ghost: "btn-brutal-white bg-ink-800 text-black hover:bg-white",
} as const;

export function MagneticButton({
  href,
  children,
  variant = "accent",
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <MotionLink
      ref={ref}
      href={href}
      whileTap={{ scale: 0.96 }}
      className={cn(
        `group relative inline-flex h-[52px] items-center justify-center gap-2
         overflow-hidden px-7 text-[15px] font-bold
         transition-colors duration-base will-transform`,
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
      <span className="relative flex items-center gap-2">
        {children}
      </span>
    </MotionLink>
  );
}
