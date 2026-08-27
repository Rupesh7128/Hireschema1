"use client";

import { useCallback, useState } from "react";

const SHARE_URL = "https://hireschema.com/reviewmycv";

function drawCard(overall: number, role: string | null): Promise<Blob> {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("no canvas"));

  ctx.fillStyle = "#f7f6f2";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#9FE870";
  ctx.fillRect(0, 0, 18, height);

  ctx.fillStyle = "#141414";
  ctx.font = "600 28px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("Hireschema", 64, 80);
  ctx.fillStyle = "#5c5c5c";
  ctx.font = "400 22px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("Free India CV review — file not stored", 64, 118);

  ctx.fillStyle = "#141414";
  ctx.font = "700 160px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(String(overall), 64, 340);
  ctx.font = "500 32px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#5c5c5c";
  ctx.fillText("/ 100 hiring score", 64, 390);

  const line = role
    ? `Best-fit read: ${role.slice(0, 48)}`
    : "Scored against live India jobs";
  ctx.font = "400 28px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(line, 64, 460);

  ctx.fillStyle = "#141414";
  ctx.font = "500 24px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(SHARE_URL, 64, 560);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("empty image"));
      else resolve(blob);
    }, "image/png");
  });
}

export function ShareScoreCard({
  overall,
  role,
}: {
  overall: number;
  role: string | null;
}) {
  const [note, setNote] = useState("");

  const share = useCallback(async () => {
    setNote("");
    const text = `India CV review: ${overall}/100. Free scorer, no account — ${SHARE_URL}`;
    try {
      const blob = await drawCard(overall, role);
      const file = new File([blob], "hireschema-cv-score.png", { type: "image/png" });
      if (navigator.share) {
        await navigator.share({
          text,
          url: SHARE_URL,
          files: [file],
        });
        setNote("Shared.");
        return;
      }
      await navigator.clipboard.writeText(text);
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(href);
      setNote("Copied the caption. Image downloaded — no name on the card.");
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setNote("Copied the caption.");
      } catch {
        setNote("Could not share from this browser.");
      }
    }
  }, [overall, role]);

  return (
    <div className="border border-ink-100 bg-paper-1 p-6">
      <p className="text-micro font-semibold uppercase tracking-[0.14em] text-accent">
        Share
      </p>
      <h3 className="mt-2 text-h3 text-ink-900">Score card — no name, no file</h3>
      <p className="mt-2 text-small text-ink-600">
        The image is only the number and a link. It does not include your résumé
        or email.
      </p>
      <button
        type="button"
        onClick={() => void share()}
        className="mt-4 border border-ink-900 bg-ink-900 px-4 py-2 text-small text-paper-0 hover:opacity-90"
      >
        Share or copy
      </button>
      {note ? <p className="mt-3 text-micro text-ink-500">{note}</p> : null}
    </div>
  );
}
