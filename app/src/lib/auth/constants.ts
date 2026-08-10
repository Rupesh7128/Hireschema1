/** Role hint cookie used by OAuth callback/bootstrap flows. */
export const SIGNUP_ROLE_COOKIE = "hireloop_signup_role";
export const SIGNUP_ROLE_MAX_AGE_SEC = 600;

/** Query param echoed on OAuth redirectTo — survives LinkedIn round-trip when cookies do not. */
export const SIGNUP_ROLE_QUERY = "signup_role";

/** Product is candidate-only; recruiter signup is retired. */
export type SignupRole = "candidate";

export function parseSignupRole(_raw: string | null | undefined): SignupRole {
  return "candidate";
}
