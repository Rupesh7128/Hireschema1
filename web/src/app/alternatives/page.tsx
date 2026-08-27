import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ALTERNATIVES } from "@/lib/alternatives";
import { INVITE_URL, REVIEW_CV_URL, SITE_URL, UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: "Naukri, Instahyre, Cutshort alternatives for India engineers",
  description:
    "Honest comparison: Naukri, Instahyre, Cutshort, and LinkedIn Jobs vs Hireschema — an India-only CV review and matcher. Not a second job board.",
  alternates: { canonical: `${SITE_URL}/alternatives` },
  openGraph: {
    title: "India job-board alternatives — Hireschema",
    description:
      "What Naukri, Instahyre, Cutshort, and LinkedIn Jobs are for — and when a free India CV review is the better first step.",
    url: `${SITE_URL}/alternatives`,
  },
};

const faqs = [
  {
    q: "What is the best Naukri alternative for software engineers in India?",
    a: "There isn’t one board that replaces Naukri’s volume. If you want a CV scored against live India roles before you mass-apply, start with Hireschema’s free review. Keep Naukri for volume. Instahyre and Cutshort are recruiter networks, not scorers.",
  },
  {
    q: "Is Hireschema a job portal?",
    a: "No. It is an India-only matcher. The public tool is a CV review. The app is invite-only. Intros go from your Gmail after you approve the email.",
  },
];

export default function AlternativesIndexPage() {
  const canonical = `${SITE_URL}/alternatives`;
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": canonical,
              url: canonical,
              name: "India job-board alternatives",
              dateModified: "2026-08-18",
              isPartOf: { "@type": "WebSite", name: "Hireschema", url: SITE_URL },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Alternatives", item: canonical },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@type": "ItemList",
              name: "Compared products",
              itemListElement: ALTERNATIVES.map((row, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: `${row.name} alternative`,
                url: `${SITE_URL}/alternatives/${row.slug}`,
              })),
            },
          ],
        }}
      />

      <nav className="text-sm text-ink-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink-900">
          Home
        </Link>{" "}
        / <span className="text-ink-700">Alternatives</span>
      </nav>

      <p className="mt-6 text-micro font-medium uppercase tracking-[0.12em] text-ink-500">
        Last updated {UPDATED} · India candidates only
      </p>
      <h1 className="mt-3 text-4xl font-bold text-ink-900">
        Naukri, Instahyre, Cutshort — what to use instead, and when not to
      </h1>
      <p className="mt-4 text-lg text-ink-700 leading-relaxed">
        Quick answer: Hireschema is not a second Naukri. It is a free{" "}
        <a href={REVIEW_CV_URL} className="text-accent hover:underline">
          CV review against live India jobs
        </a>
        , then an invite-only matcher. Intros come from your Gmail after you
        approve the words. If you need to mass-apply, stay on Naukri.
      </p>

      <ul className="mt-10 grid gap-4">
        {ALTERNATIVES.map((row) => (
          <li key={row.slug} className="border border-ink-100 bg-paper-1 p-5">
            <p className="text-micro uppercase tracking-[0.12em] text-ink-500">{row.site}</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink-900">
              <Link href={`/alternatives/${row.slug}`} className="hover:text-accent">
                {row.name} alternative
              </Link>
            </h2>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed">{row.definition}</p>
          </li>
        ))}
      </ul>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-900">Also on this site</h2>
        <ul className="mt-3 list-disc list-inside text-sm text-ink-700 space-y-1">
          <li>
            <Link href="/how-it-works" className="text-accent hover:underline">
              How Hireschema works
            </Link>
          </li>
          <li>
            <Link href="/candidates" className="text-accent hover:underline">
              For candidates
            </Link>
          </li>
          <li>
            <Link href="/jobs/software-engineer-jobs-in-bangalore" className="text-accent hover:underline">
              Software engineer jobs in Bangalore
            </Link>
          </li>
          <li>
            <a href={INVITE_URL} className="text-accent hover:underline">
              Request an invite
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-900">FAQ</h2>
        <dl className="mt-4 space-y-5">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-medium text-ink-900">{f.q}</dt>
              <dd className="mt-1 text-sm text-ink-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
