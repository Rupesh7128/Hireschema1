import { getServerApiBaseUrl } from "@/lib/api/base-url";
import {
  classifySignedInGate,
  type SignedInGate,
} from "@/lib/auth/app-destination";

type ProfileOnboardingPayload = {
  user?: { full_name?: string | null } | null;
  candidate?: {
    id?: string;
    onboarding_complete?: boolean;
    profile_complete?: boolean;
    current_title?: string | null;
    skills?: string[] | null;
    looking_for?: string | null;
  } | null;
  resume_filename?: string | null;
};

export type SignedInGateProbe = SignedInGate & {
  profile: ProfileOnboardingPayload | null;
};

export async function probeSignedInGate(opts: {
  token: string;
  apiBase?: string;
}): Promise<SignedInGateProbe> {
  const apiBase = opts.apiBase ?? getServerApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}/api/v1/me/profile`, {
      headers: { Authorization: `Bearer ${opts.token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    const body: unknown = await res.json().catch(() => null);
    const gate = classifySignedInGate(res.status, body);
    const profile =
      res.ok && body && typeof body === "object"
        ? (body as ProfileOnboardingPayload)
        : null;
    return { ...gate, profile };
  } catch {
    return { kind: "unknown", profile: null };
  }
}

export type SupabaseOnboardingCandidate = {
  onboarding_complete?: boolean | null;
  profile_complete?: boolean | null;
  current_title?: string | null;
  skills?: string[] | null;
  looking_for?: string | null;
};

/** Legacy accounts: resume + title/skills/looking_for but flag never set. */
export function isGrandfatheredOnboardingCandidate(
  candidate: SupabaseOnboardingCandidate | null | undefined,
  opts: { hasResume?: boolean } = {},
): boolean {
  if (!candidate) return false;
  if (candidate.onboarding_complete === true) return true;
  if (candidate.profile_complete === true && opts.hasResume) return true;
  if (opts.hasResume) {
    const title = candidate.current_title?.trim();
    const skills = (candidate.skills ?? []).filter((s) => s.trim()).length;
    const lookingFor = candidate.looking_for?.trim();
    if (title && (skills > 0 || lookingFor)) return true;
  }
  return false;
}

async function fetchApiOnboardingStatus(
  token: string,
  apiBase: string,
): Promise<ProfileOnboardingPayload["candidate"] | null> {
  try {
    const res = await fetch(`${apiBase}/api/v1/me/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ProfileOnboardingPayload;
    return data.candidate ?? null;
  } catch {
    return null;
  }
}

/**
 * Whether the candidate may access the dashboard.
 * API /me/profile is authoritative (includes server-side grandfather heal).
 */
export async function isOnboardingCompleteOnServer(opts: {
  token: string | undefined;
  supabaseCandidate?: SupabaseOnboardingCandidate | null;
  hasResume?: boolean;
  apiBase?: string;
}): Promise<boolean> {
  const apiBase = opts.apiBase ?? getServerApiBaseUrl();
  const grandfather = isGrandfatheredOnboardingCandidate(opts.supabaseCandidate, {
    hasResume: opts.hasResume,
  });

  if (opts.token) {
    const apiCandidate = await fetchApiOnboardingStatus(opts.token, apiBase);
    if (apiCandidate) {
      return apiCandidate.onboarding_complete === true;
    }
  }

  return grandfather || opts.supabaseCandidate?.onboarding_complete === true;
}

/**
 * Strict check for redirecting away from /onboarding — API must confirm complete.
 * Avoids bouncing when Supabase and API temporarily disagree.
 */
export async function shouldRedirectOnboardingToDashboard(opts: {
  token: string | undefined;
  apiBase?: string;
}): Promise<boolean> {
  if (!opts.token) return false;
  const apiBase = opts.apiBase ?? getServerApiBaseUrl();
  const apiCandidate = await fetchApiOnboardingStatus(opts.token, apiBase);
  return apiCandidate?.onboarding_complete === true;
}
