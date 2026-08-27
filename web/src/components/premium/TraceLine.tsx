"use client";

/**
 * A curve that weaves under the hero's trust row, with a lit segment
 * travelling along it on a loop.
 *
 * The base path is drawn once at low opacity; a second copy of the same path
 * carries a short dash that walks its length via `stroke-dashoffset`. SVG
 * stroke animation repaints reliably, unlike the `background-clip: text`
 * approach used elsewhere.
 *
 * Note the animation lives in the Tailwind config, not a raw `@keyframes` in
 * globals.css — top-level keyframes there were being dropped from the
 * production stylesheet.
 */

import { useReducedMotion } from "framer-motion";

/** Gentle undulation, roughly tracking the three trust items above it. */
const PATH =
  "M0,96 C160,96 190,28 340,28 C490,28 520,104 660,104 C800,104 840,34 990,34 C1120,34 1160,80 1280,72";

export function TraceLine({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className={className}>
      <svg
        viewBox="0 0 1280 132"
        fill="none"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="trace-rest" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9FE870" stopOpacity="0" />
            <stop offset="22%" stopColor="#9FE870" stopOpacity="0.20" />
            <stop offset="78%" stopColor="#9FE870" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#9FE870" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="trace-lit" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9FE870" stopOpacity="0" />
            <stop offset="45%" stopColor="#B4F58A" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#E6FF9B" stopOpacity="1" />
            <stop offset="100%" stopColor="#9FE870" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Resting line */}
        <path d={PATH} stroke="url(#trace-rest)" strokeWidth="1.5" />

        {/* Travelling segment */}
        {!reduced && (
          <path
            d={PATH}
            stroke="url(#trace-lit)"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-trace"
            style={{ strokeDasharray: "150 1700" }}
          />
        )}

        {/* Nodes sitting on the curve, under each trust item. */}
        {[
          [340, 28],
          [660, 104],
          [990, 34],
        ].map(([cx, cy]) => (
          <circle key={cx} cx={cx} cy={cy} r="3" fill="#9FE870" fillOpacity="0.5" />
        ))}
      </svg>
    </div>
  );
}
