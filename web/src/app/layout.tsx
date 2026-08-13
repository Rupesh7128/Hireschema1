import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hireschema.com"),
  title: {
    default: "Hireschema — AI Recruiting for India",
    template: "%s | Hireschema",
  },
  description:
    "Hireschema AI finds India-eligible roles, scores your fit, and sends a warm intro from your Gmail — after you approve every word.",
  keywords: [
    "AI recruiting India",
    "job search India",
    "hiring AI",
    "Hireschema AI AI",
    "Hireschema AI",
    "hireschema",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://hireschema.com",
    siteName: "Hireschema",
    title: "Hireschema — AI Recruiting for India",
    description:
      "Hireschema AI finds India-eligible roles, scores your fit, and sends a warm intro from your Gmail — after you approve every word.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hireschema — AI Recruiting for India",
    description: "Hireschema AI finds India-eligible roles and sends warm intros from your Gmail.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body className="font-sans antialiased bg-paper-0 text-ink-900">
        <Navbar />
        <div className="pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
