/**
 * Single destination for signed-in users.
 *
 * Dashboard and onboarding must share this so a missing Supabase `users` row,
 * a flaky /me/profile call, or invite 403 cannot ping-pong the browser.
 */
import { indiaOnlyInvitePath } from "@/lib/api/auth-fetch";
import {
  inviteThanksUrl,
  parseInviteAccessDetail,
} from "@/lib/auth/invite-access";

export type AppPath = "/dashboard" | "/onboarding";

export type SignedInGateKind = "complete" | "incomplete" | "invite" | "unknown";

export type SignedInGate = {
  kind: SignedInGateKind;
  invitePath?: string;
};

const CLIENT_HOP_KEY = "hireloop_app_dest_hops";
const CLIENT_HOP_WINDOW_MS = 8_000;
const CLIENT_HOP_LIMIT = 3;

function bodyDetail(body: unknown): unknown {
  if (typeof body === "object" && body !== null && "detail" in body) {
    return (body as { detail: unknown }).detail;
  }
  return body;
}

export function classifySignedInGate(status: number, body: unknown): SignedInGate {
  const invitePath = indiaOnlyInvitePath(status, body);
  if (invitePath) {
    return { kind: "invite", invitePath };
  }

  if (status === 403) {
    const inviteErr = parseInviteAccessDetail(bodyDetail(body));
    if (inviteErr) {
      return { kind: "invite", invitePath: inviteThanksUrl(inviteErr.inviteStatus) };
    }
  }

  if (status >= 200 && status < 300) {
    const candidate =
      typeof body === "object" && body !== null && "candidate" in body
        ? (body as { candidate?: { onboarding_complete?: boolean } | null }).candidate
        : undefined;
    return {
      kind: candidate?.onboarding_complete === true ? "complete" : "incomplete",
    };
  }

  return { kind: "unknown" };
}

/**
 * One winner. Unknown never leaves the current app path — that is what
 * previously looped (dashboard treated "no users row" as onboarding while
 * onboarding treated a later API success as dashboard).
 */
export function resolveSignedInPath(current: AppPath, gate: SignedInGate): string {
  switch (gate.kind) {
    case "complete":
      return "/dashboard";
    case "incomplete":
      return "/onboarding";
    case "invite":
      return gate.invitePath ?? "/invite?thanks=1&status=pending";
    case "unknown":
      return current;
  }
}

type DestHop = { t: number; from: string; to: string };

function isDashboardPath(path: string): boolean {
  return path === "/dashboard" || path.startsWith("/dashboard?");
}

function isOnboardingPath(path: string): boolean {
  return path === "/onboarding" || path.startsWith("/onboarding?");
}

function isPingPongHop(hop: DestHop): boolean {
  const fromDash = isDashboardPath(hop.from);
  const fromOnboarding = isOnboardingPath(hop.from);
  return (
    (fromDash && hop.to === "/onboarding") ||
    (fromOnboarding && hop.to === "/dashboard")
  );
}

/** Client safety net: stop location.replace ping-pong if the server gates disagree. */
export function shouldAllowClientAppRedirect(target: AppPath): boolean {
  if (typeof window === "undefined") return true;
  try {
    const now = Date.now();
    const raw = sessionStorage.getItem(CLIENT_HOP_KEY);
    const hops: DestHop[] = raw ? (JSON.parse(raw) as DestHop[]) : [];
    const recent = hops.filter((h) => now - h.t < CLIENT_HOP_WINDOW_MS);
    recent.push({ t: now, from: window.location.pathname, to: target });
    sessionStorage.setItem(CLIENT_HOP_KEY, JSON.stringify(recent));
    return recent.filter(isPingPongHop).length < CLIENT_HOP_LIMIT;
  } catch {
    return true;
  }
}
