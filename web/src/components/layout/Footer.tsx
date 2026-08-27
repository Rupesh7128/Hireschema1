/**
 * Footer — closes on the brand wordmark at poster scale, with the practical
 * links kept small and out of the way above it.
 */

import Link from "next/link";
import { APP_URL, REVIEW_CV_URL, INVITE_URL } from "@/lib/site";

const FOOTER_LINKS = {
  Product: [
    { href: "/how-it-works", label: "How it works" },
    { href: "/#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: REVIEW_CV_URL, label: "Review my CV" },
    { href: "/live-feed", label: "Live Feed" },
    { href: "/alternatives", label: "Naukri alternatives" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: `${APP_URL}/signup?mode=signin`, label: "Sign in" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-ink-100 bg-paper-0">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="pool-accent absolute left-1/2 top-full h-[50vh] w-[90vw] -translate-x-1/2 -translate-y-1/3 opacity-70" />
      </div>

      <div className="relative mx-auto max-w-wide px-6 pb-10 pt-20">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div>
            <div className="mb-5 flex items-center gap-2.5">
              <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0" aria-hidden>
                <rect width="48" height="48" fill="#9FE870" />
                <g transform="translate(24 24) skewX(-10) translate(-24 -24)">
                  <rect x="10.5" y="9" width="7.5" height="12.5" fill="#0A0A0B" />
                  <rect x="10.5" y="26.5" width="7.5" height="12.5" fill="#0A0A0B" />
                  <rect x="30" y="9" width="7.5" height="12.5" fill="#0A0A0B" />
                  <rect x="30" y="26.5" width="7.5" height="12.5" fill="#0A0A0B" />
                  <rect x="10.5" y="20.5" width="27" height="7" fill="#0A0A0B" />
                </g>
              </svg>
              <span className="font-display text-h3 font-bold text-ink-900">
                Hire<span className="text-accent">schema</span>
              </span>
            </div>

            <p className="max-w-xs text-body text-ink-500">
              Remote jobs for people in India — Indian companies aur worldwide
              teams. Hireschema AI warm intro bhejta hai, tumhare apne Gmail se.
            </p>

            <Link
              href={INVITE_URL}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-none bg-accent px-5 text-small font-semibold text-accent-fg transition-colors duration-base hover:bg-accent-hover"
            >
              Request an invite
            </Link>

            <div className="mt-7 space-y-1 text-[12px] text-ink-400">
              <p>Remote only · from India · salaries in INR &amp; USD</p>
              <p>DPDP Act 2023 compliant · AWS ap-south-1 (Mumbai)</p>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-4 text-micro uppercase text-ink-400">{section}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-small text-ink-500 transition-colors duration-fast hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Poster-scale wordmark */}
        <div aria-hidden className="mt-16 select-none overflow-hidden">
          <p className="whitespace-nowrap text-center font-display text-[clamp(2.25rem,12.5vw,10rem)] font-extrabold leading-[0.8] tracking-[-0.05em] text-outline">
            HIRESCHEMA
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-7 sm:flex-row">
          <p className="text-[12px] text-ink-400">
            © {new Date().getFullYear()} Hireschema · Beta
          </p>
          <div className="flex items-center gap-4 text-[12px] text-ink-400">
            <a href="mailto:privacy@hireschema.com" className="transition-colors hover:text-ink-600">
              DPO: privacy@hireschema.com
            </a>
            <span className="text-ink-200">·</span>
            <a href="mailto:hello@hireschema.com" className="transition-colors hover:text-ink-600">
              hello@hireschema.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
