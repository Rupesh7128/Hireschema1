"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "@/components/brand/icons";
import { ChatPreviewLazy } from "@/components/landing/ChatPreviewLazy";
import { LANDING_AGENT } from "@/components/landing/landing-audience";
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import { BTN_GHOST, BTN_PRIMARY } from "@/lib/button-classes";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(185,248,76,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(185,248,76,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-page px-6 pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <Stagger className="space-y-6" delay={0.05}>
            <StaggerItem>
              <span className="inline-flex items-center gap-2 text-micro font-medium text-ink-500">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[10px] font-bold text-paper-0">
                  {LANDING_AGENT.initial}
                </span>
                <Sparkles
                  className="h-3 w-3 text-accent"
                  strokeWidth={1.5}
                />
                Hireschema Beta · For candidates in India
              </span>
            </StaggerItem>

            <StaggerItem>
              <h1 className="text-[36px] font-semibold leading-[1.08] tracking-tight text-ink-900 md:text-display">
                Find roles that fit.{" "}
                <span className="text-accent">Know why. Ask for an intro.</span>
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="max-w-md text-body leading-relaxed text-ink-600">
                Hireschema AI reads your CV and finds fully remote roles you can
                do from India — Indian companies and worldwide teams (US,
                Australia, and elsewhere) that hire people sitting in India. You
                review every intro before it leaves your Gmail.
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/invite"
                  className={cn(
                    BTN_PRIMARY,
                    "group gap-2 px-6 py-3.5 text-body",
                  )}
                >
                  Request an invite
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                </Link>
                <Link
                  href="/reviewmycv"
                  className={cn(BTN_GHOST, "gap-2 px-6 py-3.5 text-body")}
                >
                  Free CV review
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {["Invite only", "Remote only · from India", "You approve every intro"].map(
                  (item) => (
                    <li
                      key={item}
                      className="inline-flex items-center gap-1.5 text-micro text-ink-500"
                    >
                      <Check
                        className="h-3.5 w-3.5 text-accent"
                        strokeWidth={2}
                      />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </StaggerItem>
          </Stagger>

          <FadeUp delay={0.15} className="md:pl-2">
            <ChatPreviewLazy />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
