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
import { ArrowRight, FileText, Check } from "@/components/brand/icons";
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
import { ShineText } from "@/components/premium/ShineText";
import { TraceLine } from "@/components/premium/TraceLine";
import { ChatPreview } from "@/components/premium/ChatPreview";
import { MemeGif } from "@/components/premium/MemeGif";
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
      className="relative overflow-hidden perspective-far"
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
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-wide flex-col justify-center px-6 pb-14 pt-24 lg:min-h-0 lg:pb-16 lg:pt-[136px]"
      >
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,410px)] lg:items-center lg:gap-12">
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
              <span className="block text-[clamp(2.25rem,min(9vw,11vh),7rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
                <SplitText
                  text="Money follows"
                  by="word"
                  stagger={0.06}
                  unitClassName="text-gradient-accent"
                />
              </span>
              <span className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[clamp(2.25rem,min(9vw,11vh),7rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
                <ShineText text="my brotha." delay={0.18} />
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block w-[clamp(120px,14vw,180px)] shrink-0"
                >
                  <MemeGif name="moneyFollows" inline caption={false} priority />
                </motion.span>
              </span>
              <span className="mt-3.5 block text-[clamp(1rem,1.9vw,1.45rem)] font-bold leading-tight text-ink-700">
                <SplitText
                  text="Roles that fit. Aur kyun fit hain, wo bhi."
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
              Hireschema AI tera CV padhta hai aur{" "}
              <span className="text-accent">fully remote</span> roles nikaalta
              hai jo tu India se kar sakta hai — Indian companies aur worldwide
              teams, dono. Har intro tere Gmail se jaane se pehle tu khud
              review karta hai.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <MemePopover gif="mumkinHai" align="left">
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
            <motion.ul
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.95 }}
              className="mt-9 grid gap-x-6 gap-y-3 sm:grid-cols-3"
            >
              {TRUST.map((t) => (
                <li key={t.label} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-accent bg-accent/10">
                    <Check className="h-3 w-3 text-accent" strokeWidth={3} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-small font-semibold leading-tight text-ink-800">
                      {t.label}
                    </span>
                    <span className="block text-[12px] leading-tight text-ink-400">
                      {t.hindi}
                    </span>
                  </span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.15 }}
            >
              <TraceLine className="mt-6 h-[110px] w-full" />
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

      </motion.div>
    </section>
  );
}
