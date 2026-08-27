import type { Metadata } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import { ToastProvider } from "@/components/ui";
import { CandidateGate } from "@/components/auth/CandidateGate";
import { OAuthReturnHandler } from "@/components/auth/OAuthReturnHandler";
import { PendingJobHandler } from "@/components/auth/PendingJobHandler";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AiOperationsProvider } from "@/components/providers/AiOperationsProvider";
import { AiOperationIndicator } from "@/components/operations/AiOperationIndicator";
import { AppWarmup } from "@/components/providers/AppWarmup";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800"],
});

const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001");

export const metadata: Metadata = {
  metadataBase: new URL(APP_ORIGIN),
  title: {
    default: "Hireschema",
    template: "%s | Hireschema",
  },
  description: "Your AI career partner — Hireschema AI is ready to help.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
  robots: {
    // App should not be indexed by search engines
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={display.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-paper-0 text-ink-900">
        <GoogleAnalytics />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-paper-0"
        >
          Skip to content
        </a>
        <ToastProvider>
          <QueryProvider>
            <AiOperationsProvider>
              <AppWarmup />
              <AiOperationIndicator />
              <Suspense fallback={null}>
                <OAuthReturnHandler />
                <PendingJobHandler />
                <CandidateGate>{children}</CandidateGate>
              </Suspense>
            </AiOperationsProvider>
          </QueryProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
