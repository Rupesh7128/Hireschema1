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
  rounded = "rounded-2xl",
  priority = false,
}: {
  name: GifKey;
  className?: string;
  caption?: boolean;
  rounded?: string;
  priority?: boolean;
}) {
  const gif = GIFS[name];
  const [failed, setFailed] = useState(false);

  return (
    <figure
      className={cn(
        "relative overflow-hidden border border-ink-200/70 bg-paper-2",
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
        <div className="flex h-full w-full items-center justify-center bg-grid-sm px-4" />
      )}

      {caption && (
        <figcaption
          className="
            pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-3 pt-8
            bg-gradient-to-t from-black/85 via-black/45 to-transparent
          "
        >
          <p
            className="
              text-center font-display text-[clamp(0.85rem,2vw,1.15rem)]
              font-extrabold leading-tight text-[#FFE45E]
              [text-shadow:0_2px_0_#000,0_-2px_0_#000,2px_0_0_#000,-2px_0_0_#000]
            "
          >
            {gif.caption}
          </p>
        </figcaption>
      )}
    </figure>
  );
}
