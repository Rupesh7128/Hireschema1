"use client";

/**
 * A meme GIF in the classic subtitle format.
 *
 * GIFs are hotlinked from a third-party CDN, so the component has to survive
 * one not loading: the box reserves its aspect ratio up front, and an `onError`
 * falls back to the caption alone rather than leaving a broken-image frame.
 *
 * Deliberately a plain <img>, not next/image — Next's optimiser would rasterise
 * an animated GIF down to a single still frame.
 */

import { useState } from "react";
import { GIFS, type GifKey } from "@/lib/gifs";
import { cn } from "@/lib/utils";

export function MemeGif({
  name,
  className,
  caption = true,
  rounded = "",
  priority = false,
  /**
   * Render with spans instead of figure/figcaption, so the GIF can sit inside
   * a heading — flow content is not valid there, phrasing content is.
   */
  inline = false,
}: {
  name: GifKey;
  className?: string;
  caption?: boolean;
  rounded?: string;
  priority?: boolean;
  inline?: boolean;
}) {
  const gif = GIFS[name];
  const [failed, setFailed] = useState(false);

  const Box = inline ? "span" : "figure";
  const Cap = inline ? "span" : "figcaption";

  return (
    <Box
      className={cn(
        "relative overflow-hidden border-2 border-black bg-paper-2 shadow-ring",
        inline && "block",
        rounded,
        className,
      )}
      style={{ aspectRatio: gif.ratio }}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={gif.src}
          alt={gif.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="block h-full w-full bg-grid-sm" />
      )}

      {caption && (
        <Cap
          className="
            pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-3 pt-8
            bg-gradient-to-t from-black/85 via-black/45 to-transparent
          "
        >
          <span
            className="
              block text-center font-display text-[clamp(0.85rem,2vw,1.15rem)]
              font-extrabold leading-tight text-[#FFE45E]
              [text-shadow:0_2px_0_#000,0_-2px_0_#000,2px_0_0_#000,-2px_0_0_#000]
            "
          >
            {gif.caption}
          </span>
        </Cap>
      )}
    </Box>
  );
}
