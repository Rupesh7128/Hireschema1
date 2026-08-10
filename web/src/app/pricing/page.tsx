import { redirect } from "next/navigation";

/** Pricing is retired — Hireschema is invite-only. */
export default function PricingPage() {
  redirect("/");
}
