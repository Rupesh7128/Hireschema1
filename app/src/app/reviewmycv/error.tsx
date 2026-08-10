"use client";

import Link from "next/link";
import { BTN_GHOST, BTN_PRIMARY } from "@/lib/button-classes";
import { cn } from "@/lib/utils";

/** Local error UI for /reviewmycv — avoid sending visitors to the dashboard. */
export default function ReviewMyCvError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper-0 px-6">
      <div className="max-w-md text-center">
        <p className="text-micro font-medium uppercase tracking-wide text-ink-500">
          Something went wrong
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink-900">
          Couldn’t finish that CV review
        </h1>
        <p className="mt-2 text-small text-ink-500">
          A temporary hiccup while scoring your résumé. Retry, or upload again from the free tool.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button type="button" onClick={reset} className={cn(BTN_PRIMARY, "px-4 py-2 text-small")}>
            Try again
          </button>
          <Link href="/reviewmycv" className={cn(BTN_GHOST, "px-4 py-2 text-small")}>
            Back to upload
          </Link>
        </div>
        <p className="mt-4">
          <Link href="/" className="text-small text-ink-500 underline-offset-4 hover:underline">
            Hireschema home
          </Link>
        </p>
      </div>
    </main>
  );
}
