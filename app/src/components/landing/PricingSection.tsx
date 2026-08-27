"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { BTN_PRIMARY } from "@/lib/button-classes";
import { cn } from "@/lib/utils";

export const LAUNCH_PRICE_INR = 500;

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-20 border-t border-ink-100">
      <div className="mx-auto max-w-page px-6 py-16 md:py-24">
        <SectionHeader
          label="Pricing"
          title="₹500 a month when we launch."
          description="Invite-only access is free today. No card, no Razorpay. When paid launch opens, the plan is ₹500 / month for remote job matching from India."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-ink-100 bg-paper-1 p-6">
            <p className="text-micro font-medium uppercase tracking-wider text-ink-500">
              Now
            </p>
            <p className="mt-2 text-h2 text-ink-900">Free · invite only</p>
            <p className="mt-3 text-small leading-relaxed text-ink-600">
              Request an invite. After approval you get remote matches you can do
              from India — Indian companies and worldwide teams (US, Australia, and
              elsewhere) that hire people sitting in India.
            </p>
            <Link href="/invite" className={cn(BTN_PRIMARY, "mt-6 inline-flex")}>
              Request invite
            </Link>
          </div>

          <div className="rounded-xl border border-accent/30 bg-ink-900 p-6 text-paper-0">
            <p className="text-micro font-medium uppercase tracking-wider text-ink-400">
              At launch
            </p>
            <p className="mt-2 text-h2">
              ₹{LAUNCH_PRICE_INR}
              <span className="text-body font-normal text-ink-400"> / month</span>
            </p>
            <p className="mt-3 text-small leading-relaxed text-ink-300">
              Same product: fully remote roles only. Salaries in INR. Intros from
              your Gmail after you approve the draft. Checkout is not live yet —
              this is the price we will charge when we open paid access.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
