/**
 * Programmatic SEO — single source of truth for the role × city landing pages.
 *
 * Both the sitemap and the /jobs/[slug] page import from here so they can never
 * diverge (previously the sitemap listed 25 pages while 64 were generated — the
 * extra 39 were uncrawlable). Expand ROLES/CITIES here to scale the index.
 */

export const ROLES = [
  "software-engineer",
  "product-manager",
  "data-scientist",
  "devops-engineer",
  "backend-developer",
  "frontend-developer",
  "full-stack-developer",
  "machine-learning-engineer",
  "ui-ux-designer",
  "product-designer",
  "data-analyst",
  "engineering-manager",
  "qa-engineer",
  "android-developer",
  "ios-developer",
  "business-analyst",
] as const;

export const CITIES = [
  "bangalore",
  "mumbai",
  "delhi",
  "hyderabad",
  "pune",
  "chennai",
  "gurgaon",
  "noida",
  "kolkata",
  "ahmedabad",
  "jaipur",
  "kochi",
  "indore",
] as const;

export function jobSlug(role: string, city: string): string {
  return `${role}-jobs-in-${city}`;
}

export function parseJobSlug(slug: string): { role: string; city: string } | null {
  const match = slug.match(/^(.+)-jobs-in-(.+)$/);
  if (!match) return null;
  return { role: match[1], city: match[2] };
}

/** "software-engineer" → "Software Engineer" */
export function titleCase(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Every role × city slug — the full programmatic index. */
export function allJobSlugs(): string[] {
  const out: string[] = [];
  for (const role of ROLES) {
    for (const city of CITIES) out.push(jobSlug(role, city));
  }
  return out;
}

/** Unique-ish FAQ copy per page — adds content depth + powers FAQPage schema. */
export function jobFaqs(roleLabel: string, cityLabel: string): { q: string; a: string }[] {
  return [
    {
      q: `How do I find ${roleLabel} jobs in ${cityLabel}?`,
      a: `Start with the free CV review (no account). After an invite, Hireschema surfaces India-only ${roleLabel} roles in ${cityLabel} ranked by match score — native apply links or a Gmail intro you approve.`,
    },
    {
      q: `Are ${roleLabel} roles in ${cityLabel} remote or on-site?`,
      a: `Hireschema only lists fully remote ${roleLabel} jobs you can do from India — Indian companies and worldwide teams that hire people sitting in India. Office and hybrid roles, including ${cityLabel} office jobs, are not listed.`,
    },
    {
      q: `What salary can a ${roleLabel} expect in ${cityLabel}?`,
      a: `Hireschema shows CTC in INR/LPA for every role and factors your expected range into the match score, so you only see ${roleLabel} roles that fit your compensation.`,
    },
    {
      q: `How is Hireschema different for ${roleLabel} job seekers?`,
      a: `Hireschema is not a second job board. It scores a CV against live India jobs, then — if you are invited — matches ${roleLabel} roles and can send a hiring-manager intro from your Gmail after you approve it. See also the Naukri alternative page.`,
    },
  ];
}
