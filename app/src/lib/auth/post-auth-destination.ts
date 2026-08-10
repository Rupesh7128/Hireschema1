/** Where to send the user immediately after auth bootstrap completes. */
export function resolvePostAuthDestination(
  _resolvedRole: string,
  isNewUser: boolean,
): string {
  // Candidate-only product — always onboarding or dashboard.
  return isNewUser ? "/onboarding" : "/dashboard";
}
