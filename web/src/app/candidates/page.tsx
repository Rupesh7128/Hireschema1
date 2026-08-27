import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Mail,
  MessageCircle,
  Mic,
  Search,
  Shield,
  Target,
  TrendingUp,
} from "@/components/brand/icons";
import { Badge } from "@/components/ui/Badge";
import { ProductPreview } from "@/components/marketing/ProductPreview";

export const metadata: Metadata = {
  title: "For Candidates — AI Career Partner",
  description:
    "Hireschema AI is your personal AI career partner. She matches you to fully remote jobs you can do from India, prepares you for interviews, and makes the warm intro to the hiring manager.",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hireschema.com";

const FEATURES = [
  {
    Icon: MessageCircle,
    title: "Talk to Hireschema AI — voice or text",
    description:
      "Chat in English or Hinglish. Hireschema AI understands your career story, goals, and constraints. Text input always available; voice mode with one tap.",
  },
  {
    Icon: FileText,
    title: "Instant profile from LinkedIn",
    description:
      "Sign in with LinkedIn and Hireschema AI pre-fills your profile — work history, skills, education — in under 60 seconds.",
  },
  {
    Icon: Target,
    title: "Semantic job matching",
    description:
      "Not keyword matching — semantic understanding of your experience against fully remote roles you can do from India.",
  },
  {
    Icon: Mail,
    title: "Warm intro to the hiring manager",
    description:
      "Request an intro — Hireschema AI drafts a personalised email from your Gmail with your approval.",
  },
  {
    Icon: TrendingUp,
    title: "Career intelligence",
    description:
      "24-layer profile: archetype, market value, likely next role, and ranked gaps to improve matches.",
  },
  {
    Icon: Mic,
    title: "20-min AI career call",
    description:
      "Book a spoken session with Hireschema AI for positioning, salary expectations, and target-role advice.",
  },
  {
    Icon: Search,
    title: "Mock interview prep",
    description:
      "Role-specific mock sessions based on the actual JD and company — not generic tips.",
  },
  {
    Icon: Shield,
    title: "DPDP-compliant by design",
    description:
      "India-only data residency, export/delete any time, you control profile visibility.",
  },
];

export default function CandidatesPage() {
  return (
    <main>
      <section className="border-b border-ink-100 bg-paper-0 py-24">
        <div className="max-w-page mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge tone="accent" className="mb-6 normal-case">
              For Job Seekers
            </Badge>
            <h1 className="text-display text-ink-900 mb-6">
              Meet <span className="text-ink-500">Hireschema AI</span> — your personal career AI
            </h1>
            <p className="text-h3 text-ink-500 font-normal mb-10 max-w-2xl mx-auto">
              She builds your career graph, finds fully remote jobs you can do from
              India, and makes the warm intro to the hiring manager — all from a
              single chat.
            </p>
            <Link
              href={`${APP_URL}/reviewmycv`}
              className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-body font-medium text-accent-fg hover:bg-accent-hover transition-colors"
            >
              Free CV review
            </Link>
            <p className="mt-4 text-small text-ink-500">
              Compare boards:{" "}
              <Link href="/alternatives/naukri" className="text-accent hover:underline">
                Naukri alternative
              </Link>
              {" · "}
              <Link href="/how-it-works" className="text-accent hover:underline">
                How it works
              </Link>
            </p>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-page mx-auto px-4 sm:px-6">
          <h2 className="text-h1 text-ink-900 text-center mb-12">What Hireschema AI does for you</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="rounded-lg border border-ink-100 bg-paper-1 p-6 space-y-3"
              >
                <Icon className="h-6 w-6 text-ink-900" strokeWidth={1.5} />
                <h3 className="text-h3 text-ink-900">{title}</h3>
                <p className="text-small text-ink-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
