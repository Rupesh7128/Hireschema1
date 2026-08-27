"use client";

/**
 * Thin lime progress rail pinned to the top of the viewport, plus a --scroll
 * CSS variable (0→1) that ambient background gradients read from.
 */

import { useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.0008,
  });

  useEffect(
    () =>
      scrollYProgress.on("change", (v) => {
        document.documentElement.style.setProperty("--scroll", v.toFixed(4));
      }),
    [scrollYProgress],
  );

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: width }}
      className="
        fixed inset-x-0 top-0 z-[70] h-[2px] origin-left
        bg-gradient-to-r from-accent via-masala to-chai
        shadow-[0_0_18px_rgba(159,232,112,0.7)]
      "
    />
  );
}
