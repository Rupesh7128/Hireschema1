"use client";

/**
 * The product itself, playing on a loop.
 *
 * A scripted candidate conversation that types itself out and restarts. This
 * is the single most load-bearing element on the page — it shows what the
 * thing actually does, so everything else can be argument rather than demo.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Mic, Send, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Line =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; actions?: string };

const AGENT = { name: "Hireschema AI", initial: "A", tagline: "AI recruiting copilot" };

const TYPING_MS = 850;
const READ_MS = 1800;
const RESTART_MS = 3200;

const SCRIPT: Line[] = [
  {
    role: "assistant",
    text: "Namaste! Main Hireschema AI hoon. Kaunsa role dhoondh rahe ho?",
  },
  {
    role: "user",
    text: "Senior backend roles, fully remote, ₹40–50 LPA. Main India mein hoon.",
  },
  {
    role: "assistant",
    text: "14 remote roles mile jo tum India se kar sakte ho. Top match: Senior Backend Engineer, 89% fit — Python, Postgres aur fintech experience ki wajah se. Role review karein?",
    actions: "Hireschema AI performed 4 actions",
  },
  { role: "user", text: "Haan. Intro draft karo, main review karunga." },
  {
    role: "assistant",
    text: "Draft ready hai. Jab tak tum approve nahi karte aur Gmail connect nahi karte, kuch bhi send nahi hoga.",
    actions: "Hireschema AI performed 2 actions",
  },
];

export function ChatPreview({ className }: { className?: string }) {
  const [shown, setShown] = useState(1);
  const [typing, setTyping] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clearAll = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    clearAll();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(SCRIPT.length);
      setTyping(false);
      return clearAll;
    }

    const schedule = (fn: () => void, ms: number) => {
      timers.current.push(setTimeout(fn, ms));
    };

    const step = (count: number) => {
      if (count >= SCRIPT.length) {
        schedule(() => {
          setShown(1);
          setTyping(false);
          step(1);
        }, RESTART_MS);
        return;
      }

      const next = SCRIPT[count];
      if (next.role === "assistant") {
        setTyping(true);
        schedule(() => {
          setTyping(false);
          setShown(count + 1);
          schedule(() => step(count + 1), READ_MS);
        }, TYPING_MS);
      } else {
        setShown(count + 1);
        schedule(() => step(count + 1), READ_MS);
      }
    };

    schedule(() => step(1), READ_MS);
    return clearAll;
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [shown, typing]);

  const visible = SCRIPT.slice(0, shown);

  return (
    <div
      className={cn(
        "glass-strong w-full overflow-hidden rounded-2xl shadow-3 edge-light",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-ink-100 px-4 py-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
          <span className="text-small font-bold text-accent-fg">{AGENT.initial}</span>
        </span>
        <div className="min-w-0">
          <p className="text-small font-semibold leading-none text-ink-900">
            {AGENT.name}
          </p>
          <p className="mt-1 text-[11px] text-ink-400">{AGENT.tagline}</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-ink-200/80 bg-paper-0/70 px-2.5 py-1 text-[11px] text-ink-500">
          <Sparkles className="h-3 w-3 text-accent" strokeWidth={1.8} />
          Example conversation
        </span>
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="h-[clamp(230px,44vh,430px)] space-y-3 overflow-y-auto bg-paper-0/60 px-4 py-4"
      >
        <AnimatePresence initial={false}>
          {visible.map((line, i) =>
            line.role === "user" ? (
              <motion.div
                key={`u-${i}`}
                initial={{ opacity: 0, y: 10, x: 8 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex justify-end"
              >
                <div className="max-w-[84%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-small font-medium leading-relaxed text-accent-fg shadow-[0_6px_24px_-10px_rgba(159,232,112,0.9)]">
                  {line.text}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`a-${i}`}
                initial={{ opacity: 0, y: 10, x: -8 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex justify-start gap-2"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-200">
                  <span className="text-[10px] font-bold text-ink-800">
                    {AGENT.initial}
                  </span>
                </span>
                <div className="max-w-[84%] space-y-1.5">
                  <div className="rounded-2xl rounded-bl-md border border-ink-200/70 bg-paper-2 px-3.5 py-2.5 text-small leading-relaxed text-ink-700">
                    {line.text}
                  </div>
                  {line.actions && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="inline-flex items-center gap-1.5 text-[11px] text-ink-400"
                    >
                      <Zap className="h-3 w-3 text-accent" strokeWidth={2} />
                      {line.actions}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            ),
          )}
        </AnimatePresence>

        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start gap-2"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-200">
                <span className="text-[10px] font-bold text-ink-800">
                  {AGENT.initial}
                </span>
              </span>
              <div className="rounded-2xl rounded-bl-md border border-ink-200/70 bg-paper-2 px-3.5 py-3">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="h-1.5 w-1.5 rounded-full bg-ink-400"
                      animate={{ scale: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <div className="border-t border-ink-100 px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl border border-ink-200/70 bg-paper-0/70 px-3 py-2">
          <span className="flex-1 select-none text-small text-ink-400">
            Message {AGENT.name}…
          </span>
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink-200/70 text-ink-500"
          >
            <Mic className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        </div>
      </div>
    </div>
  );
}
