"use client";

/**
 * Navbar — floating pill that condenses once you leave the hero.
 * Transparent over the hero stage, frosted and tightened after that.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, ArrowRight } from "@/components/brand/icons";
import { cn } from "@/lib/utils";
import { APP_URL, INVITE_URL } from "@/lib/site";

const NAV_LINKS = [
  { href: "/live-feed", label: "Live Feed" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/candidates", label: "Candidates" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setCondensed(v > 60));

  // A pinned scroll under an open sheet is a bad time.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          className={cn(
            "flex w-full max-w-wide items-center justify-between rounded-none px-4 transition-all duration-slow ease-out-soft",
            condensed
              ? "glass-blur h-14 shadow-block sm:px-5"
              : "h-16 border border-transparent bg-transparent",
          )}
        >
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Hireschema home">
            <span className="relative block h-8 w-8 shrink-0">
              <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden>
                <rect width="48" height="48" fill="#9FE870" />
                <g transform="translate(24 24) skewX(-10) translate(-24 -24)">
                  <rect x="10.5" y="9" width="7.5" height="12.5" fill="#0A0A0B" />
                  <rect x="10.5" y="26.5" width="7.5" height="12.5" fill="#0A0A0B" />
                  <rect x="30" y="9" width="7.5" height="12.5" fill="#0A0A0B" />
                  <rect x="30" y="26.5" width="7.5" height="12.5" fill="#0A0A0B" />
                  <rect x="10.5" y="20.5" width="27" height="7" fill="#0A0A0B" />
                </g>
              </svg>
              <span className="absolute inset-0 -z-10 bg-accent/40 blur-md" />
            </span>
            <span className="font-display text-h3 font-bold tracking-tight text-ink-900">
              Hire<span className="text-accent">schema</span>
            </span>
          </Link>

          {/* NAV LINKS HIDDEN FOR NOW */}
          {/*
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-none px-3.5 py-2 text-small font-medium transition-colors duration-fast",
                    active ? "text-accent" : "text-ink-500 hover:text-ink-900",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-none bg-accent/12"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </div>
          */}

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href={`${APP_URL}/signup?mode=signin`}
              className="rounded-none px-3.5 py-2 text-small font-medium text-ink-500 transition-colors duration-fast hover:text-ink-900"
            >
              Sign in
            </Link>
            <Link
              href={INVITE_URL}
              className="
                btn-brutal group inline-flex h-10 items-center gap-1.5 bg-accent
                px-4 text-small font-bold text-accent-fg
                transition-colors duration-base hover:bg-accent-hover
              "
            >
              Request invite
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-base group-hover:translate-x-0.5" strokeWidth={2.4} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-none text-ink-700 transition-colors hover:bg-ink-100 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-paper-0/98 md:hidden"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-full flex-col justify-center gap-2 px-8"
            >
              {/* NAV_LINKS are currently hidden
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.06 * i + 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block border-b border-ink-100 py-4 font-display text-h1 text-ink-900"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              */}

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href={INVITE_URL}
                  onClick={() => setMobileOpen(false)}
                  className="btn-brutal flex items-center justify-center gap-2 bg-accent py-3.5 font-bold text-accent-fg"
                >
                  Request invite <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                </Link>
                <Link
                  href={`${APP_URL}/signup?mode=signin`}
                  onClick={() => setMobileOpen(false)}
                  className="btn-brutal-white flex items-center justify-center bg-ink-800 py-3.5 font-bold text-black"
                >
                  Sign in
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
