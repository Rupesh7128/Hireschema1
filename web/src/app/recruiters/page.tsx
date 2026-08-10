import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  Inbox,
  Kanban,
  Megaphone,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProductPreview } from "@/components/marketing/ProductPreview";

export const metadata: Metadata = {
  title: "For Recruiters — AI Hiring Intelligence",
  description:
    "Hireschema is your AI recruiting partner. Semantic candidate search, contact-enriched shortlists, and warm intros via candidates' own Gmail. All in India.",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hireschema.com";

const FEATURES = [
  {
    Icon: ClipboardList,
    title: "Describe the role in plain English",
    description:
      "Tell Hireschema what you need — seniority, skills, location, comp band. She turns it into a structured hiring brief and readiness checklist.",
  },
  {
    Icon: Search,
    title: "Semantic candidate search",
    description:
      "Hireschema scores candidates in the Hireschema graph against your role — not keyword filters. Ranked shortlists with match scores and skill fit.",
  },
  {
    Icon: Users,
    title: "Ranked shortlists with score cards",
    description:
      "Every candidate shows overall match (0–100), skills matched and gaps, experience fit, and location alignment. Bias audit on every score.",
  },
  {
    Icon: Megaphone,
    title: "Publish roles to the candidate feed",
    description:
      "When your brief is ready, publish to Hireschema's India-only job feed. Candidates discover roles through Hireschema AI and request intros to you.",
  },
  {
    Icon: Inbox,
    title: "In-app intro inbox",
    description:
      "Candidate intro requests land in your recruiter inbox. Accept or decline in one click, then chat directly — no cold email blasts from Hireschema.",
  },
  {
    Icon: Kanban,
    title: "Pipeline per role",
    description:
      "Track shortlisted, intro-requested, and passed candidates per role. Pause or close roles when hiring wraps up.",
  },
];

export default function RecruitersPage() {
  return (
    <main>
      <section className="border-b border-ink-100 bg-paper-0 py-24">
        <div className="max-w-page mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge tone="accent" className="mb-6 normal-case">
              For Recruiters & Hiring Managers
            </Badge>
            <h1 className="text-display text-ink-900 mb-6">
              Meet <span className="text-ink-500">Hireschema</span> — your AI recruiter
            </h1>
            <p className="text-h3 text-ink-500 font-normal mb-10 max-w-2xl mx-auto">
              Describe the role. Hireschema builds the brief, surfaces ranked candidates,
              and manages intros in your inbox — built for India hiring teams.
            </p>
            <Link
              href={`${APP_URL}/invite`}
              className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-body font-medium text-accent-fg hover:bg-accent-hover transition-colors"
            >
              Request an invite
            </Link>
          </div>
          <ProductPreview variant="recruiter" />
        </div>
      </section>

      <section className="py-20 bg-paper-0">
        <div className="max-w-page mx-auto px-4 sm:px-6">
          <h2 className="text-h1 text-ink-900 text-center mb-12">How Hireschema works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="rounded-lg border border-ink-100 bg-paper-1 p-6 space-y-3"
              >
                <Icon className="h-6 w-6 text-ink-900" strokeWidth={1.5} />
                <h3 className="text-h3 text-ink-900">{title}</h3>
                <p className="text-small text-ink-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-paper-1 border-t border-ink-100">
        <div className="max-w-page mx-auto px-4 sm:px-6 text-center space-y-4">
          <h2 className="text-h1 text-ink-900">Start hiring with Hireschema</h2>
          <p className="text-body text-ink-500 max-w-xl mx-auto">
            Invite-only beta. Request access and we&apos;ll approve your email.
          </p>
          <Link
            href={`${APP_URL}/invite`}
            className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-body font-medium text-accent-fg hover:bg-accent-hover transition-colors"
          >
              Talk to Hireschema — free
            </Link>
        </div>
      </section>
    </main>
  );
}
