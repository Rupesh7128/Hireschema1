"use client";

/**
 * Pointer-driven 3D tilt with a specular sheen that tracks the cursor.
 *
 * The sheen matters more than the rotation — a flat card that tips is a party
 * trick, a card whose highlight moves reads as a physical object.
 */

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees at the card's edge. */
  intensity?: number;
  /** How far the content floats toward the viewer, in px. */
  lift?: number;
  glare?: boolean;
};

export function TiltCard({
  children,
  className,
  intensity = 9,
  lift = 26,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateY = useSpring(useTransform(mx, [0, 1], [-intensity, intensity]), spring);
  const rotateX = useSpring(useTransform(my, [0, 1], [intensity, -intensity]), spring);
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(my, [0, 1], ["0%", "100%"]);
  const glareBg = useTransform(
    [glareX, glareY],
    ([x, y]: string[]) =>
      `radial-gradient(340px circle at ${x} ${y}, rgba(255,255,255,0.22), transparent 62%)`,
  );

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <div ref={ref} className={cn("perspective", className)}>
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full will-transform"
      >
        <div style={{ transform: `translateZ(${lift}px)` }} className="h-full">
          {children}
        </div>

        {glare && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  );
}
