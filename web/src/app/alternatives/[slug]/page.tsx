import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ALTERNATIVES, alternativeBySlug, alternativeUrl } from "@/lib/alternatives";
import { INVITE_URL, REVIEW_CV_URL, SITE_URL, UPDATED } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ALTERNATIVES.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const row = alternativeBySlug(slug);
  if (!row) return { title: "Alternatives | Hireschema" };
  const title = `${row.name} alternative for India engineers`;
  const description = row.definition.slice(0, 155);
  const canonical = alternativeUrl(row.slug);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "article" },
  };
}

export default async function AlternativePage({ params }: PageProps) {
  const { slug } = await params;
  const row = alternativeBySlug(slug);
  if (!row) notFound();

  const canonical = alternativeUrl(row.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": canonical,
        url: canonical,
        name: `${row.name} alternative — Hireschema`,
        description: row.definition,
        dateModified: "2026-08-18",
        isPartOf: { "@type": "WebSite", name: "Hireschema", url: SITE_URL },
        about: { "@type": "SoftwareApplication", name: "Hireschema", applicationCategory: "BusinessApplication" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Alternatives", item: `${SITE_URL}/alternatives` },
          { "@type": "ListItem", position: 3, name: `${row.name} alternative`, item: canonical },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: row.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <JsonLd data={jsonLd} />

      <nav className="text-sm text-ink-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink-900">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/alternatives" className="hover:text-ink-900">
          Alternatives
        </Link>{" "}
        / <span className="text-ink-700">{row.name}</span>
      </nav>

      <p className="mt-6 text-micro font-medium uppercase tracking-[0.12em] text-ink-500">
        Last updated {UPDATED} · Fact-checked against the live product, not a pitch deck
      </p>
      <h1 className="mt-3 text-4xl font-bold text-ink-900">
        {row.name} alternative for software engineers in India
      </h1>

      <section className="mt-6 border border-ink-100 bg-paper-1 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-500">
          Quick answer
        </h2>
        <p className="mt-2 text-ink-800 leading-relaxed">{row.definition}</p>
      </section>

      <p className="mt-8 text-ink-700 leading-relaxed">{row.whyPeopleLeave}</p>

      <h2 className="mt-10 text-2xl font-semibold text-ink-900">
        {row.name} vs Hireschema
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100">
              <th className="py-2 pr-3 font-medium text-ink-500">Criterion</th>
              <th className="py-2 pr-3 font-medium text-ink-900">{row.name}</th>
              <th className="py-2 font-medium text-ink-900">Hireschema</th>
            </tr>
          </thead>
          <tbody>
            {row.rows.map((cell) => (
              <tr key={cell.criterion} className="border-b border-ink-100 align-top">
                <td className="py-3 pr-3 font-medium text-ink-800">{cell.criterion}</td>
                <td className="py-3 pr-3 text-ink-600">{cell.them}</td>
                <td className="py-3 text-ink-600">{cell.us}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-2xl font-semibold text-ink-900">Stay on {row.name} if</h2>
      <p className="mt-3 text-ink-700 leading-relaxed">{row.whoShouldStay}</p>

      <h2 className="mt-10 text-2xl font-semibold text-ink-900">Try Hireschema if</h2>
      <p className="mt-3 text-ink-700 leading-relaxed">{row.whoShouldTryUs}</p>

      <h2 className="mt-10 text-2xl font-semibold text-ink-900">What we do not claim</h2>
      <p className="mt-3 text-ink-700 leading-relaxed">{row.weAreNot}</p>

      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <a
          href={REVIEW_CV_URL}
          className="inline-flex justify-center bg-accent text-accent-fg px-6 py-3 rounded-lg font-medium"
        >
          Free CV review
        </a>
        <a
          href={INVITE_URL}
          className="inline-flex justify-center border border-ink-100 px-6 py-3 rounded-lg font-medium text-ink-800"
        >
          Request invite
        </a>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-900">FAQ</h2>
        <dl className="mt-4 space-y-5">
          {row.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-medium text-ink-900">{f.q}</dt>
              <dd className="mt-1 text-sm text-ink-700 leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-900">Internal links</h2>
        <ul className="mt-3 list-disc list-inside text-sm text-ink-700 space-y-1">
          <li>
            <Link href="/alternatives" className="text-accent hover:underline">
              All alternatives
            </Link>
          </li>
          {row.relatedSlugs.map((rel) => (
            <li key={rel}>
              <Link href={`/alternatives/${rel}`} className="text-accent hover:underline">
                {alternativeBySlug(rel)?.name} alternative
              </Link>
            </li>
          ))}
          <li>
            <Link href="/how-it-works" className="text-accent hover:underline">
              How it works
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
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy (DPDP)
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
