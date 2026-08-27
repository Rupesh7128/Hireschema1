import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SmoothScroll } from "@/components/premium/SmoothScroll";
import { ScrollProgress } from "@/components/premium/ScrollProgress";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hireschema.com"),
  title: {
    default: "Hireschema — Remote jobs from India, bina doglapan ke",
    template: "%s | Hireschema",
  },
  description:
    "Hireschema AI finds fully remote roles you can do from India — Indian companies and worldwide teams — and sends a warm intro from your Gmail after you approve every word.",
  keywords: [
    "remote jobs India",
    "AI job search India",
    "work from home jobs India",
    "US remote jobs from India",
    "Hireschema AI",
    "hireschema",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://hireschema.com",
    siteName: "Hireschema",
    title: "Hireschema — Money follows my brotha. Remote roles, bina doglapan ke.",
    description:
      "Fully remote roles you can do from India. Hireschema AI scores every match and sends a warm intro from your Gmail — after you approve every word.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hireschema — Money follows my brotha.",
    description:
      "Fully remote jobs you can do from India. Warm intros from your own Gmail.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="grain bg-paper-0 font-sans text-ink-900 antialiased">
        <GoogleAnalytics />
        <SmoothScroll />
        <ScrollProgress />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
