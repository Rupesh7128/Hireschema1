"use client";

/**
 * Wraps any control so a meme GIF pops up above it on hover.
 *
 * Two rules keep this from being annoying:
 *  - Pointer-only. On touch there is no hover state, and a popup that fires on
 *    tap would eat the tap that was meant for the button.
 *  - The GIF only starts downloading on first hover, so a page with several of
 *    these costs nothing until someone actually reaches for a button.
 *
 * The popover is absolutely positioned and pointer-events-none, so it can never
 * intercept the click or shift the layout underneath it.
 */

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MemeGif } from "@/components/premium/MemeGif";
import type { GifKey } from "@/lib/gifs";
import { cn } from "@/lib/utils";

export function MemePopover({
  gif,
  children,
  className,
  /** Nudge the popover horizontally, for buttons near a viewport edge. */
  align = "center",
  width = 260,
}: {
  gif: GifKey;
  children: ReactNode;
  className?: string;
  align?: "center" | "left" | "right";
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  // Once hovered we keep the <img> mounted so re-hovering doesn't re-fetch.
  const [primed, setPrimed] = useState(false);
  const reduced = useReducedMotion();

  const show = () => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setPrimed(true);
    setOpen(true);
  };

  return (
    <span
      className={cn("relative inline-flex", className)}
      onPointerEnter={show}
      onPointerLeave={() => setOpen(false)}
    >
      {children}

      <AnimatePresence>
        {open && primed && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0, y: 14, scale: 0.86, rotate: -4 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: -2.5 }}
            exit={{ opacity: 0, y: 10, scale: 0.9, rotate: -4 }}
            transition={{ type: "spring", stiffness: 420, damping: 26, mass: 0.6 }}
            style={{ width }}
            className={cn(
              "pointer-events-none absolute bottom-[calc(100%+14px)] z-50 block shadow-block",
              align === "center" && "left-1/2 -translate-x-1/2",
              align === "left" && "left-0",
              align === "right" && "right-0",
            )}
          >
            <MemeGif name={gif} rounded="rounded-xl" />
            {/* Tail */}
            <span
              className={cn(
                "absolute -bottom-[5px] h-3 w-3 rotate-45 border-b border-r border-ink-200/70 bg-paper-2",
                align === "center" && "left-1/2 -translate-x-1/2",
                align === "left" && "left-8",
                align === "right" && "right-8",
              )}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
