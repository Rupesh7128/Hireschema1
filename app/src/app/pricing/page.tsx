import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Hireschema is invite-only and free today. At launch: ₹500 per month for remote jobs you can do from India.",
};

export default function PricingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-paper-0 px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <p className="text-micro font-medium uppercase tracking-wider text-ink-500">
          Pricing
        </p>
        <h1 className="text-h1 text-ink-900">₹500 a month when we launch.</h1>
        <p className="text-body leading-relaxed text-ink-600">
          Hireschema matches people in India to <strong>fully remote</strong>{" "}
          jobs — Indian companies and worldwide teams (US, Australia, and
          elsewhere) that hire someone sitting in India. Office and hybrid roles
          are not in the product.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-ink-100 p-5">
            <p className="text-micro uppercase text-ink-500">Now</p>
            <p className="mt-1 text-h3 text-ink-900">Free · invite only</p>
            <p className="mt-2 text-small text-ink-600">
              No card. Request access and we approve manually.
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-ink-900 p-5 text-paper-0">
            <p className="text-micro uppercase text-ink-400">At launch</p>
            <p className="mt-1 text-h3">₹500 / month</p>
            <p className="mt-2 text-small text-ink-300">
              Paid checkout is not live yet (no Razorpay in MVP). This is the
              planned price.
            </p>
          </div>
        </div>
        <Link
          href="/invite"
          className="inline-flex h-12 items-center rounded-md bg-accent px-5 font-medium text-accent-fg"
        >
          Request an invite
        </Link>
      </div>
    </main>
  );
}
