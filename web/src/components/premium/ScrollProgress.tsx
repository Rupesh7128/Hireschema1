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

  return null;
}
