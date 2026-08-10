/**
 * Shared client helper: sign out + send unapproved sign-ins to the thank-you invite page.
 */
import {
  InviteAccessError,
  inviteThanksUrl,
} from "@/lib/auth/invite-access";

type AuthClient = {
  auth: {
    signOut: () => Promise<unknown>;
  };
};

export async function redirectForInviteAccess(
  supabase: AuthClient,
  navigate: (href: string) => void,
  error: InviteAccessError,
): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    /* best-effort — still show thank-you */
  }
  navigate(inviteThanksUrl(error.inviteStatus));
}

export function isInviteAccessError(error: unknown): error is InviteAccessError {
  return error instanceof InviteAccessError;
}
