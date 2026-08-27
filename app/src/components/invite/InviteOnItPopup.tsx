"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "@/components/brand/icons";
import { cn } from "@/lib/utils";
import { BTN_ICON, BTN_PRIMARY } from "@/lib/button-classes";

/** Official Pepsi India Giphy — Salman "bro" reaction (200w, not the 7MB original). */
const SALMAN_GIF =
  "https://media.giphy.com/media/eHRZiEmlGcZw7uTOqZ/200w.webp";

export function InviteOnItPopup({
  open,
  onClose,
  approved = false,
}: {
  open: boolean;
  onClose: () => void;
  approved?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [gifFailed, setGifFailed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (open) setGifFailed(false);
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  const headline = approved ? "You're in, bro." : "We are on it, bro.";
  const thought = approved ? "Approved. Sign in." : "Invite aaya… jaldi the late.";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="invite-on-it-title"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100vw-32px)] max-w-sm overflow-visible border-0 bg-transparent p-0",
        "backdrop:bg-ink-900/55 backdrop:backdrop-blur-[2px]",
      )}
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl border border-ink-900 bg-ink-900 shadow-2"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={cn(
                BTN_ICON,
                "absolute right-2 top-2 z-10 h-8 w-8 bg-ink-900/50 text-paper-0 hover:bg-ink-900/80",
              )}
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>

            <div className="relative aspect-[4/5] w-full bg-ink-800">
              {!gifFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={SALMAN_GIF}
                  alt="Salman Khan — we are on it"
                  className="h-full w-full object-cover object-top"
                  onError={() => setGifFailed(true)}
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-h3 text-paper-0">
                  We are on it, bro.
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink-900 to-transparent" />

              {/* Thought trail */}
              <div className="absolute left-4 top-10 flex items-end gap-1.5">
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="h-2 w-2 rounded-full bg-paper-0"
                />
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.28 }}
                  className="h-3 w-3 rounded-full bg-paper-0"
                />
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="h-4 w-4 rounded-full bg-paper-0"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.55, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-3 top-6 max-w-[70%] rounded-[1.4rem] rounded-bl-md border-2 border-ink-900 bg-paper-0 px-4 py-3 shadow-2"
              >
                <p className="text-[11px] italic leading-snug text-ink-500">
                  {thought}
                </p>
                <p
                  id="invite-on-it-title"
                  className="mt-1 text-[22px] font-semibold leading-[1.15] tracking-tight text-ink-900"
                >
                  {headline}
                </p>
              </motion.div>
            </div>

            <div className="space-y-3 px-5 pb-5 pt-3">
              <p className="text-small leading-relaxed text-ink-300">
                {approved
                  ? "This email can sign in now."
                  : "Got the request. A founder will approve — we'll email you."}
              </p>
              {approved ? (
                <a
                  href="/signup?mode=signin"
                  className={cn(BTN_PRIMARY, "w-full justify-center py-2.5 text-small")}
                >
                  Sign in
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(BTN_PRIMARY, "w-full justify-center py-2.5 text-small")}
                >
                  Okay, bro
                </button>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </dialog>
  );
}
