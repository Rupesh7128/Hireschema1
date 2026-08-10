/** Landing page audience toggle — Hireschema AI serves candidates, Hireschema serves recruiters. */
export type LandingAudience = "candidate" | "recruiter";

export const LANDING_AGENTS = {
  candidate: {
    name: "Hireschema AI",
    initial: "A",
    tagline: "AI recruiter for job seekers",
    chatTagline: "AI recruiting copilot",
  },
  recruiter: {
    name: "Hireschema",
    initial: "N",
    tagline: "AI sourcer for hiring teams",
    chatTagline: "AI sourcing copilot",
  },
} as const;
