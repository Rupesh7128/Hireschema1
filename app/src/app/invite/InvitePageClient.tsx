"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HireschemaLogo } from "@/components/brand/HireschemaLogo";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { createClient } from "@/lib/supabase/client";
import { BTN_GHOST, BTN_PRIMARY } from "@/lib/button-classes";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";

type InviteResult = {
  message: string;
  status: string;
  already_exists?: boolean;
};

const THANKS_PENDING =
  "Thank you for requesting an invite. We'll get back to you.";
const THANKS_REJECTED =
  "This invite request was declined. Contact hello@hireschema.com if that seems wrong.";

export function InvitePageClient() {
  const searchParams = useSearchParams();
  const thanksFromAuth = searchParams.get("thanks") === "1";
  const statusFromAuth = searchParams.get("status") || "pending";
  const indiaWaitlist = searchParams.get("reason") === "india";

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InviteResult | null>(() =>
    thanksFromAuth
      ? {
          message:
            statusFromAuth === "rejected" ? THANKS_REJECTED : THANKS_PENDING,
          status: statusFromAuth === "rejected" ? "rejected" : "pending",
        }
      : null,
  );

  const showThanks = useMemo(() => Boolean(result), [result]);

  // Blocked sign-ins land here with a leftover Supabase session — clear it so
  // middleware can't bounce them into /dashboard without an approved account.
  useEffect(() => {
    if (!thanksFromAuth) return;
    const supabase = createClient();
    void supabase.auth.signOut().catch(() => undefined);
  }, [thanksFromAuth]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/public/invite-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          full_name: fullName.trim() || null,
          note: note.trim() || null,
          source: "invite_page",
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        detail?: string;
        message?: string;
        status?: string;
        already_exists?: boolean;
      };
      if (!res.ok) {
        throw new Error(
          typeof body.detail === "string" ? body.detail : "Could not submit invite request.",
        );
      }
      const status = body.status || "pending";
      setResult({
        message:
          status === "approved"
            ? body.message || "You're approved — sign in with this email."
            : status === "rejected"
              ? THANKS_REJECTED
              : THANKS_PENDING,
        status,
        already_exists: body.already_exists,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-paper-0">
      <header className="border-b border-ink-100">
        <div className="mx-auto flex h-14 max-w-page items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2" aria-label="Hireschema home">
            <HireschemaLogo size={28} />
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
              Invite only
            </span>
          </Link>
          <Link href="/signup?mode=signin" className={cn(BTN_GHOST, "px-3 py-2 text-small")}>
            Sign in
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-6 py-16">
        <p className="text-micro font-semibold uppercase tracking-[0.14em] text-accent">
          Private beta
        </p>
        <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight text-ink-900">
          {showThanks
            ? "You're on the list"
            : indiaWaitlist
              ? "India-only for now"
              : "Request an invite"}
        </h1>
        <p className="mt-3 text-body leading-relaxed text-ink-500">
          {showThanks
            ? "Only approved emails can sign in and open the dashboard. Hang tight — we'll email you when you're in."
            : indiaWaitlist
              ? "Hireschema is built for Indian candidates and Indian roles, with salaries in INR. Leave your email if you want access when we expand — or if you're in India and this was a mistake."
              : "Hireschema is invite-only. Leave your email — use the same address you'll sign in with (LinkedIn email). A founder will approve access."}
        </p>

        {result ? (
          <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
            <p className="text-h3 text-ink-900">
              {result.status === "approved" ? "You're approved" : "Thank you"}
            </p>
            <p className="mt-2 text-small leading-relaxed text-ink-600">{result.message}</p>
            {result.status === "approved" ? (
              <Link
                href="/signup?mode=signin"
                className={cn(BTN_PRIMARY, "mt-6 inline-flex px-5 py-2.5 text-small")}
              >
                Sign in now
              </Link>
            ) : (
              <p className="mt-4 text-micro text-ink-400">
                Already approved later?{" "}
                <Link href="/signup?mode=signin" className="text-accent hover:underline">
                  Sign in here
                </Link>
                .
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4 border border-ink-100 bg-paper-1 p-6">
            <div>
              <label htmlFor="invite-email" className="text-micro font-medium text-ink-500">
                Email
              </label>
              <Input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-1.5"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="invite-name" className="text-micro font-medium text-ink-500">
                Name <span className="text-ink-400">(optional)</span>
              </label>
              <Input
                id="invite-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="mt-1.5"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="invite-note" className="text-micro font-medium text-ink-500">
                Why Hireschema? <span className="text-ink-400">(optional)</span>
              </label>
              <textarea
                id="invite-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Role you're targeting, city, anything helpful…"
                className="mt-1.5 w-full border border-ink-100 bg-paper-0 px-3 py-2 text-small text-ink-900 placeholder:text-ink-400 focus:border-accent focus:outline-none"
              />
            </div>
            {error ? (
              <p className="text-small text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className={cn(BTN_PRIMARY, "w-full justify-center px-5 py-3 text-body")}
            >
              {loading ? "Submitting…" : "Request invite"}
            </button>
            <p className="text-center text-micro text-ink-400">
              Already have access?{" "}
              <Link href="/signup?mode=signin" className="text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
