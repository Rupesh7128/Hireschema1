/**
 * Onboarding entry — candidate sign-up only (Hireschema AI CV wizard).
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerApiBaseUrl } from "@/lib/api/base-url";
import { resolveSignupMethod } from "@/lib/auth/signup-method";
import { displayNameFromSupabaseUser } from "@/lib/auth/display-name";
import { resolveSignedInPath } from "@/lib/auth/app-destination";
import { probeSignedInGate } from "@/lib/auth/server-onboarding";
import { createClient } from "@/lib/supabase/server";
import { OnboardingClientGate } from "@/components/auth/OnboardingClientGate";
import { OnboardingFlow } from "./OnboardingFlow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get started — Hireschema",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/invite");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const apiBase = getServerApiBaseUrl();

  let apiFullName: string | undefined;
  if (token) {
    const gate = await probeSignedInGate({ token, apiBase });
    const dest = resolveSignedInPath("/onboarding", gate);
    if (dest !== "/onboarding") {
      redirect(dest);
    }
    apiFullName = gate.profile?.user?.full_name?.trim() || undefined;
  }

  let candidateName: string | undefined = apiFullName || displayNameFromSupabaseUser(user);

  if (!candidateName && token) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from("users")
          .select("full_name")
          .eq("id", user.id)
          .single() as { data: { full_name: string | null } | null };
        candidateName = data?.full_name?.trim() || candidateName;
      }
    } catch {
      // Swallow — not blocking
    }
  }

  const signupMethod = resolveSignupMethod(user);

  return (
    <OnboardingClientGate>
      <OnboardingFlow candidateName={candidateName} signupMethod={signupMethod} />
    </OnboardingClientGate>
  );
}
