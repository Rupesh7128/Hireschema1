"use client";

/**
 * The hero's trust row and the curve beneath it, as one connected unit.
 *
 * A lit pulse walks the curve on a loop; as it reaches the node under each
 * item, that item lights up with it. Everything runs off a single rAF
 * timeline, so the line and the highlights cannot drift apart.
 *
 * Node positions are measured from the rendered items rather than hardcoded,
 * so the curve stays aligned if the copy, the column widths or the number of
 * items ever change.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Check } from "@/components/brand/icons";
import { cn } from "@/lib/utils";

type Item = { label: string; hindi: string };

const BOX_H = 132;
const REST_Y = 84;
const PEAK_Y = 30;
const TROUGH_Y = 102;
const LOOP_MS = 7200;
/** How close (in path fraction) the pulse must be for an item to light. */
const HIT = 0.055;

/** Cubic segment that leaves and arrives horizontally, so extrema stay smooth. */
function seg(x1: number, y1: number, x2: number, y2: number) {
  const d = (x2 - x1) / 3;
  return `C${x1 + d},${y1} ${x2 - d},${y2} ${x2},${y2}`;
}

function buildPath(xs: number[], w: number) {
  if (!xs.length || !w) return "";
  const ys = xs.map((_, i) => (i % 2 === 0 ? PEAK_Y : TROUGH_Y));
  let d = `M0,${REST_Y} `;
  d += seg(0, REST_Y, xs[0], ys[0]) + " ";
  for (let i = 1; i < xs.length; i++) {
    d += seg(xs[i - 1], ys[i - 1], xs[i], ys[i]) + " ";
  }
  d += seg(xs[xs.length - 1], ys[ys.length - 1], w, REST_Y);
  return d;
}

export function TrustTrace({
  items,
  className,
}: {
  items: Item[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);

  const [geom, setGeom] = useState<{ w: number; xs: number[] }>({ w: 0, xs: [] });
  const [active, setActive] = useState<number | null>(null);
  /** Path fraction of each node, filled once the path exists. */
  const nodeAt = useRef<number[]>([]);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const box = wrap.getBoundingClientRect();
    if (!box.width) return;
    const xs = [...wrap.querySelectorAll<HTMLElement>("[data-trace-node]")].map(
      (el) => {
        const r = el.getBoundingClientRect();
        return Math.round(r.left - box.left + r.width / 2);
      },
    );
    setGeom((prev) =>
      prev.w === Math.round(box.width) && prev.xs.join() === xs.join()
        ? prev
        : { w: Math.round(box.width), xs },
    );
  }, []);

  useEffect(() => {
    // Two passes: once now, once after layout settles (fonts, grid).
    measure();
    const id = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [measure]);

  // Where each node falls along the path, by arc length.
  useEffect(() => {
    const path = pathRef.current;
    if (!path || !geom.xs.length) return;
    const total = path.getTotalLength();
    if (!total) return;
    nodeAt.current = geom.xs.map((x) => {
      // Walk the path to find the length whose point is nearest this x.
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i <= 240; i++) {
        const len = (i / 240) * total;
        const d = Math.abs(path.getPointAtLength(len).x - x);
        if (d < bestD) {
          bestD = d;
          best = len;
        }
      }
      return best / total;
    });
  }, [geom]);

  // One timeline drives the dash, the pulse dot and the active item.
  useEffect(() => {
    if (reduced || !geom.xs.length) return;
    let raf = 0;
    let start = 0;

    const tick = (t: number) => {
      if (!start) start = t;
      const p = ((t - start) % LOOP_MS) / LOOP_MS;

      const path = pathRef.current;
      const dot = pulseRef.current;
      if (path && dot) {
        const total = path.getTotalLength();
        const pt = path.getPointAtLength(p * total);
        dot.setAttribute("cx", String(pt.x));
        dot.setAttribute("cy", String(pt.y));
        path.style.strokeDashoffset = String((1 - p) * total);
      }

      const hit = nodeAt.current.findIndex((n) => Math.abs(n - p) < HIT);
      setActive((prev) => (prev === (hit === -1 ? null : hit) ? prev : hit === -1 ? null : hit));

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, geom]);

  const d = buildPath(geom.xs, geom.w);
  const total = pathRef.current?.getTotalLength() ?? 0;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
        {items.map((t, i) => {
          const lit = active === i;
          return (
            <li key={t.label} className="flex items-start gap-2.5">
              <span
                data-trace-node
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-all duration-500 ease-out-soft",
                  lit
                    ? "border-accent bg-accent/25 shadow-[0_0_16px_rgba(159,232,112,0.55)]"
                    : "border-accent/70 bg-accent/10",
                )}
              >
                <Check className="h-3 w-3 text-accent" strokeWidth={3} />
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-small font-semibold leading-tight transition-colors duration-500",
                    lit ? "text-accent" : "text-ink-800",
                  )}
                >
                  {t.label}
                </span>
                <span className="block text-[12px] leading-tight text-ink-400">
                  {t.hindi}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {/* The curve, hanging off the row above it. */}
      <div aria-hidden className="mt-4" style={{ height: BOX_H }}>
        {d && (
          <svg
            viewBox={`0 0 ${geom.w} ${BOX_H}`}
            fill="none"
            className="h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id="trust-rest" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9FE870" stopOpacity="0" />
                <stop offset="20%" stopColor="#9FE870" stopOpacity="0.22" />
                <stop offset="80%" stopColor="#9FE870" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#9FE870" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Stems tying each item down to its node. */}
            {geom.xs.map((x, i) => (
              <line
                key={x}
                x1={x}
                y1={0}
                x2={x}
                y2={i % 2 === 0 ? PEAK_Y : TROUGH_Y}
                stroke="#9FE870"
                strokeOpacity={active === i ? 0.5 : 0.14}
                strokeWidth="1"
                strokeDasharray="2 4"
                className="transition-[stroke-opacity] duration-500"
              />
            ))}

            <path d={d} stroke="url(#trust-rest)" strokeWidth="1.5" />

            {!reduced && (
              <path
                ref={pathRef}
                d={d}
                stroke="#B4F58A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={total ? `${Math.max(70, total * 0.1)} ${total}` : undefined}
              />
            )}

            {geom.xs.map((x, i) => (
              <circle
                key={x}
                cx={x}
                cy={i % 2 === 0 ? PEAK_Y : TROUGH_Y}
                r={active === i ? 5 : 3}
                fill="#9FE870"
                fillOpacity={active === i ? 1 : 0.45}
                className="transition-all duration-500"
              />
            ))}

            {!reduced && (
              <circle
                ref={pulseRef}
                r="4"
                fill="#E6FF9B"
                className="drop-shadow-[0_0_6px_rgba(159,232,112,0.9)]"
              />
            )}
          </svg>
        )}
      </div>
    </div>
  );
}
