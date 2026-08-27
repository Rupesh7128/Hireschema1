"use client";

/**
 * Hero — the 3D stage.
 *
 * A perspective floor recedes to a vanishing point, the live chat demo floats
 * above it and drifts with the pointer, and the whole rig tips back and sinks
 * as you scroll out of it, like a camera craning up off a set.
 */

import { useRef } from "react";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { SplitText } from "@/components/premium/SplitText";
import { ChatPreview } from "@/components/premium/ChatPreview";
import { INVITE_URL, REVIEW_CV_URL } from "@/lib/site";

const TRUST = [
  { label: "Invite only", hindi: "VIP entry hai" },
  { label: "Remote only, from India", hindi: "Office nahi jaana!" },
  { label: "You approve every intro", hindi: "Control Uday, control" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Camera cranes up and away as the hero exits.
  const stageRotate = useTransform(scrollYProgress, [0, 1], [0, 12]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const stageOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const floorY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  // Pointer drift, damped — the parallax should feel like weight, not a jitter.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 60, damping: 20, mass: 0.8 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduced) return;
    px.set((e.clientX / window.innerWidth - 0.5) * 2);
    py.set((e.clientY / window.innerHeight - 0.5) * 2);
  };

  const near = { x: useTransform(sx, [-1, 1], [22, -22]), y: useTransform(sy, [-1, 1], [16, -16]) };
  const headX = useTransform(sx, [-1, 1], [10, -10]);

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      className="relative min-h-[104svh] overflow-hidden perspective-far"
    >
      {/* ── Backdrop ────────────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Ambient colour wash */}
        <div className="pool-accent absolute left-1/2 top-[-18%] h-[70vh] w-[120vw] -translate-x-1/2" />
        <div className="pool-masala absolute right-[-12%] top-[22%] h-[46vh] w-[46vw]" />
        <div className="pool-volt absolute left-[-10%] top-[46%] h-[42vh] w-[40vw]" />

        {/* Perspective floor */}
        <motion.div
          style={reduced ? undefined : { y: floorY }}
          className="absolute inset-x-0 bottom-0 h-[62vh] [transform-style:preserve-3d]"
        >
          <div
            className="absolute inset-0 bg-grid origin-bottom"
            style={{ transform: "rotateX(72deg) scale(2.6)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-paper-0 via-paper-0/70 to-transparent" />
        </motion.div>

        {/* Horizon line */}
        <div className="absolute inset-x-0 top-[62%] h-px hairline opacity-60" />
      </div>

      {/* ── Stage ───────────────────────────────────────────────────── */}
      <motion.div
        style={
          reduced
            ? undefined
            : {
                rotateX: stageRotate,
                y: stageY,
                scale: stageScale,
                opacity: stageOpacity,
                transformStyle: "preserve-3d",
              }
        }
        className="relative z-10 mx-auto flex min-h-[104svh] max-w-wide flex-col justify-center px-6 pb-24 pt-32"
      >
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_440px]">
          {/* Copy column */}
          <motion.div style={reduced ? undefined : { x: headX }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="eyebrow mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Private beta · Invite only · Free
            </motion.div>

            <h1 className="mb-7 font-display">
              <span className="block text-mega">
                <SplitText
                  text="Paisa hi paisa"
                  by="word"
                  stagger={0.06}
                  unitClassName="text-gradient-accent"
                />
              </span>
              <span className="block text-mega">
                <SplitText
                  text="hoga."
                  by="word"
                  delay={0.18}
                  unitClassName="text-outline"
                />
              </span>
              <span className="mt-5 block text-[clamp(1.15rem,2.6vw,2rem)] font-bold leading-tight text-ink-700">
                <SplitText
                  text="Remote roles that actually fit — bina doglapan ke."
                  by="word"
                  stagger={0.028}
                  delay={0.4}
                />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10 max-w-prose text-lead text-ink-500"
            >
              <span className="font-semibold text-ink-700">Dekh raha hai Binod?</span>{" "}
              Hireschema AI tera CV padh ke US, Australia aur global teams ki{" "}
              <span className="text-accent">fully remote</span> jobs nikaal raha hai.
              No fake &lsquo;hybrid&rsquo; promises. Har intro tu khud approve karega —
              tere apne Gmail se jaayega.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <MagneticButton href={INVITE_URL}>
                Jor jor se sabko scheme bata de
                <ArrowRight className="h-4 w-4 transition-transform duration-base group-hover:translate-x-1" strokeWidth={2.2} />
              </MagneticButton>
              <MagneticButton href={REVIEW_CV_URL} variant="ghost">
                <FileText className="h-4 w-4" strokeWidth={2} />
                Free CV review
              </MagneticButton>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-3 text-small text-ink-400"
            >
              Aaiye, dekhte hain — mazaa aayega.
            </motion.p>

            {/* Trust row */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.05 }}
              className="mt-12 grid gap-3 sm:grid-cols-3"
            >
              {TRUST.map((t) => (
                <li
                  key={t.label}
                  className="glass rounded-xl px-4 py-3 edge-light"
                >
                  <p className="flex items-center gap-2 text-small font-semibold text-ink-800">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.2} />
                    {t.label}
                  </p>
                  <p className="mt-0.5 pl-[22px] text-[12px] text-ink-400">{t.hindi}</p>
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* The product, running */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateY: -12 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={reduced ? undefined : { x: near.x, y: near.y }}
            className="relative preserve-3d"
          >
            {/* Depth: a dimmer card parked behind the live one. */}
            <div
              aria-hidden
              className="glass absolute inset-x-6 -top-4 h-full rounded-2xl opacity-40"
              style={{ transform: "translateZ(-60px) rotate(-2.5deg)" }}
            />
            <ChatPreview />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-4 text-center text-small text-ink-400"
            >
              Ek hi chat. Search, score, intro — sab yahin.
            </motion.p>
          </motion.div>

        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        style={reduced ? undefined : { opacity: stageOpacity }}
        className="absolute inset-x-0 bottom-7 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-400">
          Scroll kar
        </span>
        <span className="relative flex h-9 w-[22px] justify-center rounded-full border border-ink-300/70 pt-1.5">
          <motion.span
            animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-accent"
          />
        </span>
      </motion.div>
    </section>
  );
}
