"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import { Check } from "@/components/brand/icons";
import { cn } from "@/lib/utils";

type Item = { label: string; hindi: string };

const AMP = 22;
const LOOP_MS = 7600;
const HIT = 0.06;

type Pt = { x: number; y: number };

const TRAIL = [
  { len: 0.15, op: 0.16, w: 2.5 },
  { len: 0.08, op: 0.4,  w: 2   },
  { len: 0.035, op: 0.95, w: 2  },
];

function buildPath(pts: Pt[], w: number): string {
  if (pts.length < 2 || !w) return "";
  let d = `M 0,${pts[0].y} L ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    // Create a smooth horizontal S-curve between points
    const dist = p2.x - p1.x;
    const ctrl = Math.max(dist * 0.4, 40);
    d += ` C ${p1.x + ctrl},${p1.y} ${p2.x - ctrl},${p2.y} ${p2.x},${p2.y}`;
  }
  d += ` L ${w},${pts[pts.length - 1].y}`;
  return d;
}

export function TrustTrace({
  items,
  className,
}: {
  items: Item[];
  className?: string;
}) {
  const reduced   = useReducedMotion();
  const wrapRef   = useRef<HTMLDivElement>(null);
  const baseRef   = useRef<SVGPathElement>(null);
  const pulseRef  = useRef<SVGGElement>(null);

  const [geom, setGeom] = useState<{ w: number; h: number; pts: Pt[] }>({
    w: 0, h: 0, pts: [],
  });
  const [active,  setActive]  = useState<number | null>(null);
  const [pathLen, setPathLen] = useState(0);
  const nodeAt = useRef<number[]>([]);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const box = wrap.getBoundingClientRect();
    if (!box.width) return;
    const pts = [...wrap.querySelectorAll<HTMLElement>("[data-trace-node]")].map(
      (el) => {
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(r.left - box.left + r.width  / 2),
          y: Math.round(r.top  - box.top  + r.height / 2),
        };
      },
    );
    const next = { w: Math.round(box.width), h: Math.round(box.height), pts };
    setGeom((prev) =>
      prev.w === next.w &&
      prev.h === next.h &&
      JSON.stringify(prev.pts) === JSON.stringify(next.pts)
        ? prev : next,
    );
  }, []);

  useEffect(() => {
    measure();
    const id = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => { cancelAnimationFrame(id); ro.disconnect(); };
  }, [measure]);

  useLayoutEffect(() => {
    const base = baseRef.current;
    if (!base) return;
    const len = base.getTotalLength();
    if (len) setPathLen(len);
  }, [geom]);

  useEffect(() => {
    const base = baseRef.current;
    if (!base || !geom.pts.length) return;
    const total = base.getTotalLength();
    if (!total) return;
    nodeAt.current = geom.pts.map(({ x, y }) => {
      let best = 0, bestD = Infinity;
      for (let i = 0; i <= 300; i++) {
        const len = (i / 300) * total;
        const pt  = base.getPointAtLength(len);
        const d   = (pt.x - x) ** 2 + (pt.y - y) ** 2;
        if (d < bestD) { bestD = d; best = len; }
      }
      return best / total;
    });
  }, [geom]);

  useEffect(() => {
    if (reduced || !geom.pts.length) return;
    let raf = 0, start = 0;

    const tick = (t: number) => {
      if (!start) start = t;
      const p = ((t - start) % LOOP_MS) / LOOP_MS;

      const base = baseRef.current;
      if (base) {
        const total = base.getTotalLength();
        const D = p * total;
        
        base
          .closest("svg")
          ?.querySelectorAll<SVGPathElement>(".trust-trail")
          .forEach((el) => {
            const tLen = parseFloat(el.getAttribute("data-len") || "0.1");
            const L = Math.max(28, total * tLen);
            // Offset = L - D aligns the head of the dash exactly at distance D
            el.style.strokeDashoffset = (L - D).toFixed(2);
          });

        const pulse = pulseRef.current;
        if (pulse) {
          const pt = base.getPointAtLength(D);
          pulse.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
        }
      }

      const hit  = nodeAt.current.findIndex((n) => Math.abs(n - p) < HIT);
      const next = hit === -1 ? null : hit;
      setActive((prev) => (prev === next ? prev : next));

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, geom]);

  const d     = buildPath(geom.pts, geom.w);
  const total = pathLen;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {d && (
        <svg
          aria-hidden
          viewBox={`0 0 ${geom.w} ${geom.h}`}
          fill="none"
          overflow="visible"
          className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
        >
          <defs>
            <linearGradient id="trust-rest" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#9FE870" stopOpacity="0"    />
              <stop offset="18%"  stopColor="#9FE870" stopOpacity="0.26" />
              <stop offset="82%"  stopColor="#9FE870" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#9FE870" stopOpacity="0"    />
            </linearGradient>
          </defs>

          <path ref={baseRef} d={d} stroke="url(#trust-rest)" strokeWidth="1.5" />

          {!reduced && TRAIL.map((t) => {
            const L = total ? Math.max(28, total * t.len) : 28;
            return (
              <path
                key={t.len}
                d={d}
                data-len={t.len}
                stroke="#B4F58A"
                strokeOpacity={t.op}
                strokeWidth={t.w}
                strokeLinecap="round"
                className="trust-trail"
                strokeDasharray={total ? `${L} ${total * 2}` : undefined}
                strokeDashoffset={total ? L : undefined}
              />
            );
          })}

          {!reduced && (
            <g ref={pulseRef}>
              <circle r="7"   fill="#9FE870" fillOpacity="0.18" />
              <circle r="3.5" fill="#E6FF9B" />
            </g>
          )}
        </svg>
      )}

      <ul className="relative grid gap-x-6 gap-y-4 sm:grid-cols-3">
        {items.map((t, i) => {
          const lit = active === i;
          return (
            <li
              key={t.label}
              className="flex flex-col items-start gap-3 transition-transform duration-slow ease-out-soft sm:[&:nth-child(even)]:translate-y-[var(--amp)]"
              style={{ "--amp": `${AMP}px` } as React.CSSProperties}
            >
              <span
                data-trace-node
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center border bg-paper-0 transition-all duration-500 ease-out-soft rounded-sm",
                  lit ? "border-accent shadow-[0_0_18px_rgba(159,232,112,0.6)]" : "border-accent/60",
                )}
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5 transition-colors duration-500",
                    lit ? "text-accent" : "text-accent/70",
                  )}
                  strokeWidth={3}
                />
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
                <span className="block text-[12px] leading-tight text-ink-400 mt-1">
                  {t.hindi}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <div aria-hidden className="hidden sm:block" style={{ height: AMP }} />
    </div>
  );
}
