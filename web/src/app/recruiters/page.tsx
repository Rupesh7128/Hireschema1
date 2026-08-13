import { permanentRedirect } from "next/navigation";

/** Recruiter product is retired — send leftover /recruiters traffic to candidates. */
export default function RecruitersPage() {
  permanentRedirect("/candidates");
}
