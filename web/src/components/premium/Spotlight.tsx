"use client";

/**
 * A soft light that trails the pointer, one layer above the page background.
 * Publishes --mx/--my so other components can key off pointer position too.
 * Pointer-only: skipped on touch, where there is no cursor to follow.
 */

import { useEffect, useState } from "react";

export function Spotlight() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);

    let raf = 0;
    let running = false;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    const tick = () => {
      // Lag the light behind the cursor — instant tracking reads as cheap.
      x += (tx - x) * 0.09;
      y += (ty - y) * 0.09;
      const root = document.documentElement.style;
      root.setProperty("--mx", `${x.toFixed(1)}px`);
      root.setProperty("--my", `${y.toFixed(1)}px`);

      // Park the loop once we have caught up. A permanently running rAF that
      // writes CSS vars keeps the compositor awake for no visible benefit.
      if (Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5]"
      style={{
        background:
          "radial-gradient(400px circle at var(--mx) var(--my), rgba(159,232,112,0.09), rgba(255,176,32,0.04) 42%, transparent 72%)",
      }}
    />
  );
}
