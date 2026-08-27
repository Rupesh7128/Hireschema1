import { INVITE_URL, REVIEW_CV_URL, SITE_URL } from "./site";

export type CompareRow = {
  criterion: string;
  them: string;
  us: string;
};

export type Alternative = {
  slug: string;
  name: string;
  site: string;
  query: string;
  definition: string;
  whyPeopleLeave: string;
  whoShouldStay: string;
  whoShouldTryUs: string;
  weAreNot: string;
  rows: CompareRow[];
  faqs: { q: string; a: string }[];
  relatedSlugs: string[];
};

const HIRE = "Hireschema";

export const ALTERNATIVES: Alternative[] = [
  {
    slug: "naukri",
    name: "Naukri",
    site: "naukri.com",
    query: "Naukri alternative for software engineers",
    definition:
      "Naukri is India’s largest job board: you search, click Apply, and wait. Hireschema is not a second Naukri. It is a remote-job matcher for people in India — free CV review, then invite-only matches (Indian companies and worldwide teams you can join from India) and a warm intro from your Gmail.",
    whyPeopleLeave:
      "Engineers with 2–8 years in Bangalore, Hyderabad, NCR, or Pune often get recruiter spam, keyword filters, and silence. Naukri is built for volume. Volume is the product. Matching is not.",
    whoShouldStay:
      "Stay on Naukri if you want to mass-apply to hundreds of postings, or if a recruiter already runs your search there. That workflow is real. We do not copy it.",
    whoShouldTryUs:
      "Try Hireschema if you want one honest score of your CV against live India jobs before you spray applications — and a path to an intro from your Gmail, not a portal message.",
    weAreNot:
      "We are not a job board with Naukri’s catalogue. We do not promise interviews. We do not email hiring managers from SendGrid. Invite-only app access. The CV review is free and the file is not stored.",
    rows: [
      {
        criterion: "What it is",
        them: "Job board + recruiter database",
        us: "India-only candidate matcher + free CV review",
      },
      {
        criterion: "How you apply",
        them: "Click Apply on a posting, often into an ATS",
        us: "Direct apply on the job’s own link, or Request Intro from your Gmail after you approve the draft",
      },
      {
        criterion: "CV vs live India jobs",
        them: "Keyword / portal relevance. You guess fit.",
        us: "Public scorer at /reviewmycv. File scored in memory, not kept",
      },
      {
        criterion: "India lock",
        them: "India-heavy, not a product lock",
        us: "Candidates and roles are India-only (INR, +91)",
      },
      {
        criterion: "Cost to the candidate",
        them: "Free to apply; paid boosts exist on the portal",
        us: "CV review free. App is invite-only. No card in MVP",
      },
    ],
    faqs: [
      {
        q: "Is Hireschema a Naukri alternative?",
        a: "For software engineers who are tired of spray-and-pray, yes — as a matcher, not as a second job board. Naukri still has more postings. Hireschema scores your CV against live India roles and, if you are invited, can send a hiring-manager intro from your Gmail after you approve it.",
      },
      {
        q: "Can I mass-apply like Naukri?",
        a: "No. If your tactic is 200 applies a week, stay on Naukri. We do not build that.",
      },
      {
        q: "Do you scrape Naukri with my login?",
        a: "No. We do not store LinkedIn or Naukri cookies. Jobs come through licensed ingest, not your session.",
      },
      {
        q: "Where do I start without an invite?",
        a: `Free CV review: ${REVIEW_CV_URL}. Invite waitlist: ${INVITE_URL}.`,
      },
    ],
    relatedSlugs: ["instahyre", "cutshort", "linkedin-jobs"],
  },
  {
    slug: "instahyre",
    name: "Instahyre",
    site: "instahyre.com",
    query: "Instahyre alternative",
    definition:
      "Instahyre is a recruiter-pull network: you keep a profile, companies reach out. Hireschema is candidate-pull. You score a CV against live India jobs, then — if invited — pick a role and approve a Gmail intro. Different door, same country.",
    whyPeopleLeave:
      "If nobody contacts you, the board is quiet. Senior and startup profiles do better. Mid-level SWEs in India often want a score they can act on, not a waiting room.",
    whoShouldStay:
      "Stay on Instahyre if recruiters already find you there and the inbound is real. Do not drop a working inbound channel.",
    whoShouldTryUs:
      "Use Hireschema when you want to see fit against live India JDs yourself, in minutes, without waiting for a recruiter to open your profile.",
    weAreNot:
      "We are not Instahyre’s recruiter inbox. We do not sell candidate contact data. We do not run a recruiter CRM.",
    rows: [
      {
        criterion: "Who starts the conversation",
        them: "Company / recruiter reaches out",
        us: "You start: review CV, then request an intro you approve",
      },
      {
        criterion: "Profile vs CV file",
        them: "Hosted profile recruiters search",
        us: "Upload a CV for a one-shot public review; app profile after invite",
      },
      {
        criterion: "India",
        them: "India-focused hiring network",
        us: "India-only marketplace by product rule",
      },
      {
        criterion: "Warm intro from your Gmail",
        them: "No — they message you inside the product",
        us: "Yes, after you approve the draft. Not SendGrid cold mail",
      },
    ],
    faqs: [
      {
        q: "Instahyre vs Hireschema — which is better?",
        a: "Instahyre is better if inbound recruiter interest already works for you. Hireschema is better if you want a CV score against live India roles and an intro sent from your own Gmail. Many people keep both.",
      },
      {
        q: "Do I delete Instahyre?",
        a: "No. Keep working inbound. Add a free CV review so you know what live JDs actually want.",
      },
      {
        q: "Is Hireschema invite-only like Instahyre?",
        a: `The CV review is public and free. The matcher app is invite-only: ${INVITE_URL}.`,
      },
    ],
    relatedSlugs: ["naukri", "cutshort", "linkedin-jobs"],
  },
  {
    slug: "cutshort",
    name: "Cutshort",
    site: "cutshort.io",
    query: "Cutshort alternative for developers",
    definition:
      "Cutshort is a two-sided India hiring network: candidates apply, recruiters message, often with a Chrome plugin on the recruiter side. Hireschema is one-sided by design — built for the candidate. No recruiter seat in MVP. No plugin that lives in a recruiter’s Naukri tab.",
    whyPeopleLeave:
      "If the other side goes quiet, you are stuck refreshing. Developers looking for a fit score against current India JDs do not get that as a first-class public tool on Cutshort.",
    whoShouldStay:
      "Stay if you already get recruiter replies there. Startup-heavy searches often belong on Cutshort.",
    whoShouldTryUs:
      "Try Hireschema for a public CV review against live India jobs, then an invite to match + Gmail intro. Complementary, not a clone.",
    weAreNot:
      "We are not a recruiter Chrome extension. We do not sell InMail-style blasts. Phase 1–21 has no payments.",
    rows: [
      {
        criterion: "Audience in the product",
        them: "Candidates and recruiters",
        us: "Candidates in India. Recruiter CRM is not the MVP",
      },
      {
        criterion: "Public CV vs live jobs",
        them: "Not the homepage action",
        us: `Yes — ${REVIEW_CV_URL}`,
      },
      {
        criterion: "Intro email",
        them: "In-product messaging",
        us: "Your Gmail, your approval, then send",
      },
      {
        criterion: "India",
        them: "India hiring network",
        us: "India-only lock (market = IN)",
      },
    ],
    faqs: [
      {
        q: "Is Hireschema a Cutshort alternative?",
        a: "For a developer who wants a CV scored against India jobs, yes as a starting point. Cutshort remains a recruiter network. We do not replace recruiter chat.",
      },
      {
        q: "Do you have a recruiter plugin?",
        a: "No. A candidate JD-tab extension may score a CV against a public posting. That is not a recruiter tool.",
      },
    ],
    relatedSlugs: ["naukri", "instahyre", "linkedin-jobs"],
  },
  {
    slug: "linkedin-jobs",
    name: "LinkedIn Jobs",
    site: "linkedin.com/jobs",
    query: "LinkedIn Jobs alternative India",
    definition:
      "LinkedIn Jobs is a global Easy Apply graph. Hireschema is India-only. We do not compete as a professional network. We compete on one job: score an Indian CV against India roles, then intro from the candidate’s Gmail — not from a LinkedIn InMail quota.",
    whyPeopleLeave:
      "Easy Apply is fast and noisy. India SWEs still get ghosted. LinkedIn is not locked to INR, +91, or Indian onsite/remote rules.",
    whoShouldStay:
      "Keep LinkedIn for network, posts, and companies that only hire there. Do not abandon a network for a matcher.",
    whoShouldTryUs:
      "Use Hireschema when the question is “does this CV fit live India jobs?” not “who viewed my profile.”",
    weAreNot:
      "We do not scrape LinkedIn with cookies. Signup may use LinkedIn OAuth. That is login, not scraping. We do not send InMail.",
    rows: [
      {
        criterion: "Geography",
        them: "Global",
        us: "India candidates + India-visible jobs only",
      },
      {
        criterion: "Apply mechanic",
        them: "Easy Apply / company ATS",
        us: "Native job link, or Gmail intro you approve",
      },
      {
        criterion: "CV review",
        them: "Not a public India-job scorer",
        us: "Free public review, file not stored",
      },
      {
        criterion: "Salaries",
        them: "Mixed currencies",
        us: "Shown in INR (LPA)",
      },
    ],
    faqs: [
      {
        q: "Is Hireschema a LinkedIn Jobs alternative in India?",
        a: "It is an India-only matcher, not a LinkedIn replacement. Keep LinkedIn. Add a CV review against India jobs if Easy Apply is going nowhere.",
      },
      {
        q: "Do you scrape my LinkedIn with cookies?",
        a: "No. Hard no. OAuth login is not cookie scraping. We do not store raw LinkedIn cookies.",
      },
    ],
    relatedSlugs: ["naukri", "instahyre", "cutshort"],
  },
];

export function alternativeBySlug(slug: string): Alternative | undefined {
  return ALTERNATIVES.find((row) => row.slug === slug);
}

export function alternativeUrl(slug: string): string {
  return `${SITE_URL}/alternatives/${slug}`;
}

export { HIRE };
