import type { Metadata } from "next";
import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hireschema.com";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Hireschema is invite-only and free today. At launch: ₹500 per month for remote jobs you can do from India.",
};

export default function PricingPage() {
  return (
    <main className="py-16 bg-paper-1 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
          Pricing
        </p>
        <h1 className="text-4xl font-semibold text-ink-900">
          ₹500 a month when we launch.
        </h1>
        <p className="text-lg text-ink-700 leading-relaxed">
          Hireschema is for people in India looking for <strong>fully remote</strong>{" "}
          work — Indian companies and worldwide teams (US, Australia, and
          elsewhere) that hire someone sitting in India. No office or hybrid
          listings.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-ink-100 bg-paper-0 p-6">
            <p className="text-xs uppercase text-ink-500">Now</p>
            <p className="mt-1 text-xl font-semibold">Free · invite only</p>
            <p className="mt-2 text-sm text-ink-600">
              Request an invite. No card. Manual approve.
            </p>
          </div>
          <div className="rounded-xl bg-ink-900 text-paper-0 p-6">
            <p className="text-xs uppercase text-ink-400">At launch</p>
            <p className="mt-1 text-xl font-semibold">₹500 / month</p>
            <p className="mt-2 text-sm text-ink-300">
              Checkout is not live yet. This is the planned price.
            </p>
          </div>
        </div>
        <Link
          href={`${APP_URL}/invite`}
          className="inline-flex bg-accent text-accent-fg px-6 py-3 rounded-xl font-medium"
        >
          Request an invite
        </Link>
      </div>
    </main>
  );
}
