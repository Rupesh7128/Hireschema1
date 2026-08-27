"use client";

/**
 * Hero — the 3D stage.
 *
 * Layout: headline and chat demo sit side by side and are top-aligned, so the
 * chat tracks the headline instead of floating halfway down a very tall column.
 * The trust strip is a full-width band across the bottom of both columns, which
 * is what keeps it inside the fold rather than pushed past it.
 *
 * The whole rig tips back and sinks as you scroll out, like a camera craning up
 * off a set — but it holds full opacity until the section is most of the way
 * gone, so nothing fades out while it is still the thing you are reading.
 */

import { useRef } from "react";
import { ArrowRight, FileText, Check } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { MemePopover } from "@/components/premium/MemePopover";
import { SplitText } from "@/components/premium/SplitText";
import { ChatPreview } from "@/components/premium/ChatPreview";
import { INVITE_URL, REVIEW_CV_URL } from "@/lib/site";

const TRUST = [
  { label: "Invite only", hindi: "VIP entry hai" },
  { label: "Remote only, from India", hindi: "Office nahi jaana" },
  { label: "You approve every intro", hindi: "Control tumhare paas" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Hold the content readable, then release it late.
  const stageRotate = useTransform(scrollYProgress, [0, 1], [0, 9]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const stageOpacity = useTransform(scrollYProgress, [0, 0.62, 1], [1, 1, 0]);
  const floorY = useTransform(scrollYProgress, [0, 1], [0, 160]);

  // Pointer drift, damped — parallax should read as weight, not jitter.
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

  const chatX = useTransform(sx, [-1, 1], [18, -18]);
  const chatY = useTransform(sy, [-1, 1], [12, -12]);
  const headX = useTransform(sx, [-1, 1], [8, -8]);

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      className="relative min-h-[100svh] overflow-hidden perspective-far lg:h-[100svh]"
    >
      {/* ── Backdrop ────────────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="pool-accent absolute left-1/2 top-[-20%] h-[64vh] w-[120vw] -translate-x-1/2" />

        <motion.div
          style={reduced ? undefined : { y: floorY }}
          className="absolute inset-x-0 bottom-0 h-[56vh]"
        >
          <div
            className="absolute inset-0 origin-bottom bg-grid"
            style={{ transform: "rotateX(72deg) scale(2.6)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-paper-0 via-paper-0/70 to-transparent" />
        </motion.div>
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
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-wide flex-col px-6 pb-8 pt-24 lg:h-[100svh] lg:min-h-0 lg:pb-7 lg:pt-[92px]"
      >
        <div className="grid flex-1 items-start gap-10 pt-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,400px)] lg:gap-12 lg:pt-2">
          {/* Copy column */}
          <motion.div style={reduced ? undefined : { x: headX }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="eyebrow mb-5"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Private beta · Invite only · Free
            </motion.div>

            <h1 className="mb-5 font-display">
              <span className="block text-[clamp(2.25rem,min(8.5vw,9.5vh),6.5rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
                <SplitText
                  text="Money follows"
                  by="word"
                  stagger={0.06}
                  unitClassName="text-gradient-accent"
                />
              </span>
              <span className="block text-[clamp(2.25rem,min(8.5vw,9.5vh),6.5rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
                <SplitText text="my brotha." by="word" delay={0.18} unitClassName="text-outline" />
              </span>
              <span className="mt-3.5 block text-[clamp(1rem,1.9vw,1.45rem)] font-bold leading-tight text-ink-700">
                <SplitText
                  text="Remote roles that actually fit — bina doglapan ke."
                  by="word"
                  stagger={0.026}
                  delay={0.4}
                />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="mb-7 max-w-prose text-body text-ink-500"
            >
              <span className="font-semibold text-ink-700">Dekh raha hai Binod?</span>{" "}
              Hireschema AI tera CV padh ke US, Australia aur global teams ki{" "}
              <span className="text-accent">fully remote</span> jobs nikaal raha
              hai. Har intro tu khud approve karega — tere apne Gmail se jaayega.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <MemePopover gif="paisa" align="left">
                <MagneticButton href={INVITE_URL}>
                  Request an invite
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-base group-hover:translate-x-1"
                    strokeWidth={2.2}
                  />
                </MagneticButton>
              </MemePopover>

              <MemePopover gif="raviConfused">
                <MagneticButton href={REVIEW_CV_URL} variant="ghost">
                  <FileText className="h-4 w-4" strokeWidth={2} />
                  Free CV review
                </MagneticButton>
              </MemePopover>
            </motion.div>
          </motion.div>

          {/* The product, running */}
          <motion.div
            initial={{ opacity: 0, y: 36, rotateY: -10 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={reduced ? undefined : { x: chatX, y: chatY }}
            className="relative w-full"
          >
            <ChatPreview />
            <p className="mt-3 text-center text-small text-ink-400">
              Ek hi chat. Search, score, intro — sab yahin.
            </p>
          </motion.div>
        </div>

        {/* Trust band — spans both columns so it always lands inside the fold. */}
        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="mt-8 grid shrink-0 gap-3 sm:grid-cols-3 lg:mt-6"
        >
          {TRUST.map((t) => (
            <li key={t.label} className="glass flex items-center gap-3 rounded-xl px-4 py-3 edge-light">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
                <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2.6} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-small font-semibold text-ink-800">
                  {t.label}
                </span>
                <span className="block truncate text-[12px] text-ink-400">{t.hindi}</span>
              </span>
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}
