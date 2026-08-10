import type { Metadata } from "next";
import { Suspense } from "react";
import { InvitePageClient } from "./InvitePageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request an invite",
};

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-paper-0 px-6 py-16">
          <div className="mx-auto max-w-lg space-y-4">
            <div className="h-4 w-24 rounded bg-ink-100 animate-pulse" />
            <div className="h-8 w-64 rounded bg-ink-100 animate-pulse" />
            <div className="h-20 w-full rounded bg-ink-100 animate-pulse" />
          </div>
        </main>
      }
    >
      <InvitePageClient />
    </Suspense>
  );
}
