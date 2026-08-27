"use client";

/**
 * Closing scene — the camera pulls back out of the grid one last time and the
 * headline lands. Same visual language as the hero, so the page reads as a
 * loop rather than a list.
 */

import { useRef } from "react";
import { ArrowRight, FileText } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { MemePopover } from "@/components/premium/MemePopover";
import { SplitText } from "@/components/premium/SplitText";
import { INVITE_URL, REVIEW_CV_URL } from "@/lib/site";

export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [16, 0]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-32 perspective-far"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 bottom-0 h-[70vh] origin-bottom bg-grid opacity-70 [transform:rotateX(74deg)_scale(2.4)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper-0 via-paper-0/60 to-transparent" />
      </div>

      <motion.div
        style={
          reduced ? undefined : { scale, rotateX, transformStyle: "preserve-3d" }
        }
        className="relative mx-auto max-w-page px-6 text-center will-transform"
      >
        <span className="eyebrow mb-8">Last call</span>

        <h2 className="font-display text-display">
          <span className="block">
            <SplitText
              text="Ab tera number"
              by="word"
              unitClassName="text-gradient-accent"
            />
          </span>
          <span className="block">
            <SplitText
              text="aane wala hai."
              by="word"
              delay={0.15}
              unitClassName="text-outline-accent"
            />
          </span>
        </h2>

        <p className="mx-auto mt-7 max-w-prose text-lead text-ink-500">
          Job hunting ko full-time job banne ki zaroorat nahi hai. Invite
          maang, CV daal, aur dekh kaunse remote roles tere liye actually
          banne hain.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MemePopover gif="jaldiTheLate">
            <MagneticButton href={INVITE_URL}>
              Request an invite
              <ArrowRight className="h-4 w-4 transition-transform duration-base group-hover:translate-x-1" strokeWidth={2.2} />
            </MagneticButton>
          </MemePopover>
          <MemePopover gif="raviReacted">
            <MagneticButton href={REVIEW_CV_URL} variant="ghost">
              <FileText className="h-4 w-4" strokeWidth={2} />
              Pehle CV review karao
            </MagneticButton>
          </MemePopover>
        </div>

        <p className="mt-6 text-small text-ink-400">
          Beta · Free to start · No credit card
        </p>
      </motion.div>
    </section>
  );
}
