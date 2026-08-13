"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchMyProfile } from "@/lib/api/profile";
import { shouldAllowClientAppRedirect } from "@/lib/auth/app-destination";
import {
  isClientOnboardingCompleteRecent,
  markClientOnboardingComplete,
  sleep,
} from "@/lib/auth/onboarding-complete";

const GATE_MAX_WAIT_MS = 12_000;
const PROFILE_FETCH_TIMEOUT_MS = 8_000;

/**
 * Prevents the onboarding wizard from flashing when activation already finished.
 * Only redirects when the API confirms onboarding_complete (with short retries
 * after POST /complete-onboarding while the profile revalidates).
 */
export function OnboardingClientGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [slowApi, setSlowApi] = useState(false);
  const [redirectBlocked, setRedirectBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const deadline = Date.now() + GATE_MAX_WAIT_MS;

    void (async () => {
      try {
        const { data } = await createClient().auth.getUser();
        const userId = data.user?.id;

        const delays = isClientOnboardingCompleteRecent(60_000)
          ? [0, 400, 900, 1800]
          : [0];

        for (const delayMs of delays) {
          if (cancelled) return;
          if (Date.now() >= deadline) break;
          if (delayMs > 0) await sleep(delayMs);

          const profile = await Promise.race([
            fetchMyProfile({ force: true }),
            sleep(PROFILE_FETCH_TIMEOUT_MS).then(() => {
              throw new Error("profile_fetch_timeout");
            }),
          ]);
          if (cancelled) return;

          if (profile.candidate?.onboarding_complete === true) {
            markClientOnboardingComplete(userId);
            if (shouldAllowClientAppRedirect("/dashboard")) {
              window.location.replace("/dashboard");
              return;
            }
            setRedirectBlocked(true);
            setReady(true);
            return;
          }
        }
      } catch (err) {
        if (!cancelled && err instanceof Error && err.message === "profile_fetch_timeout") {
          setSlowApi(true);
        }
        /* show wizard */
      }

      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-paper-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-small text-ink-500">Loading…</p>
        {slowApi ? (
          <p className="text-caption text-ink-400 max-w-sm">
            The server is taking longer than usual. You can continue setup below in a moment.
          </p>
        ) : null}
      </div>
    );
  }

  if (redirectBlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper-0 px-6 text-center">
        <p className="text-body text-ink-900">You&apos;re already set up.</p>
        <p className="max-w-sm text-small text-ink-500">
          Open your dashboard to keep going. If this page sent you in a loop, stay here and refresh once.
        </p>
        <a href="/dashboard" className="text-small font-medium text-accent hover:underline">
          Open dashboard
        </a>
      </main>
    );
  }

  return children;
}
