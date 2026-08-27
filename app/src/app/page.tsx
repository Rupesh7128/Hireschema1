import { LandingPage } from "@/components/landing/LandingPage";

export const metadata = {
  title: "Hireschema — Money follows my brotha. Remote roles that fit.",
  description:
    "Hireschema AI tera CV padhta hai aur fully remote roles nikaalta hai jo tu India se kar sakta hai — Indian companies aur worldwide teams. Har intro tere Gmail se jaane se pehle tu khud review karta hai.",
};

/** App landing page (hireschema.com) — static shell, animated client sections. */
export const dynamic = "force-static";

export default function RootPage() {
  return <LandingPage />;
}
