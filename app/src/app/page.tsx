import { LandingPage } from "@/components/landing/LandingPage";

export const metadata = {
  title: "Hireschema Beta — AI recruiting for India",
  description:
    "Hireschema AI finds India-eligible roles, explains your fit, and sends a warm intro from your Gmail after you approve it. Now in beta in India.",
};

/** App landing page (hireschema.com) — static shell, animated client sections. */
export const dynamic = "force-static";

export default function RootPage() {
  return <LandingPage />;
}
