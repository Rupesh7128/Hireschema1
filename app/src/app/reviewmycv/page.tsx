import type { Metadata } from "next";
import ReviewMyCvPage from "./ReviewMyCvClient";

export const metadata: Metadata = {
  title: "Review my CV — free elite recruiter scorecard",
  description:
    "Upload your résumé for a free recruiter-grade scorecard. See impact, clarity, ATS, and India market fit — then join Hireschema to unlock matches.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Review my CV | Hireschema",
    description:
      "Free elite recruiter CV review for India. Scorecard in seconds — then unlock matched roles.",
  },
};

export default function Page() {
  return <ReviewMyCvPage />;
}
