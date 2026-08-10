"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const EXT_MESSAGE_TYPE = "HIRESCHEMA_EXTENSION_AUTH";

type ChromeRuntime = {
  sendMessage?: (extensionId: string, message: unknown) => void;
};

function getChromeRuntime(): ChromeRuntime | null {
  const g = globalThis as typeof globalThis & { chrome?: { runtime?: ChromeRuntime } };
  return g.chrome?.runtime ?? null;
}

/**
 * Hand the signed-in Supabase access token to the Chrome extension.
 * Content script on this origin relays chrome.runtime.sendMessage.
 */
export default function ExtensionConnectPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "need_login" | "sent">("loading");
  const [error, setError] = useState<string | null>(null);

  const extensionId = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("id");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const supabase = createClient();
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (cancelled) return;
        if (sessionError) {
          setError(sessionError.message);
          setStatus("need_login");
          return;
        }
        const session = data.session;
        if (!session?.access_token) {
          setStatus("need_login");
          return;
        }

        const payload = {
          type: EXT_MESSAGE_TYPE,
          accessToken: session.access_token,
          refreshToken: session.refresh_token ?? null,
          expiresAt: session.expires_at ?? null,
          email: session.user.email ?? null,
        };

        window.dispatchEvent(new CustomEvent("hireschema-extension-auth", { detail: payload }));
        window.postMessage({ source: "hireschema-app", ...payload }, window.location.origin);

        const runtime = getChromeRuntime();
        if (extensionId && runtime?.sendMessage) {
          try {
            runtime.sendMessage(extensionId, payload);
          } catch {
            // Content script relay is the primary path.
          }
        }

        setStatus("sent");
        setTimeout(() => {
          if (!cancelled) setStatus("ok");
        }, 400);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not connect extension");
          setStatus("need_login");
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [extensionId]);

  const loginHref = `/signup?mode=signin&redirect=${encodeURIComponent("/extension/connect")}`;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="font-display text-2xl text-ink-900">Connect Chrome extension</h1>
      <p className="text-sm text-ink-600">
        Link your Hireschema account so the extension can save jobs to your tracker.
      </p>

      {status === "loading" && <p className="text-sm text-ink-500">Checking your session…</p>}
      {status === "sent" && (
        <p className="text-sm text-accent">Sending credentials to the extension…</p>
      )}
      {status === "ok" && (
        <p className="text-sm text-ink-800">
          Connected. You can close this tab and use Save job on LinkedIn or career pages.
        </p>
      )}
      {status === "need_login" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-700">Sign in first, then return here to finish connecting.</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Link
            href={loginHref}
            className="inline-flex w-fit rounded-md bg-ink-900 px-4 py-2 text-sm text-white"
          >
            Sign in
          </Link>
        </div>
      )}

      <Link href="/dashboard?panel=jobs&tab=saved" className="text-sm text-accent underline">
        Open job tracker
      </Link>
    </main>
  );
}
