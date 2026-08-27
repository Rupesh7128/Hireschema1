import type { RemotePreference } from "@/lib/api/profile";

type RemoteFlagFields = {
  is_remote?: boolean | null;
  employment_type?: string | null;
};

type JobLocationFields = RemoteFlagFields & {
  location_city?: string | null;
  location_state?: string | null;
};

const OFFICE_EMPLOYMENT = new Set(["hybrid", "onsite", "on-site", "on_site", "office"]);
const REMOTE_EMPLOYMENT = new Set(["remote", "wfh", "work from home", "work_from_home"]);

/** Fully remote / WFH only — hybrid and office roles do not count. */
export function jobIsFullyRemote(job: RemoteFlagFields): boolean {
  const emp = (job.employment_type || "").trim().toLowerCase();
  if (OFFICE_EMPLOYMENT.has(emp) || emp.startsWith("hybrid") || emp.startsWith("onsite")) {
    return false;
  }
  if (REMOTE_EMPLOYMENT.has(emp) || emp.startsWith("remote")) {
    return true;
  }
  return Boolean(job.is_remote);
}

export function jobLocationLabel(job: JobLocationFields): string | null {
  const city = [job.location_city, job.location_state].filter(Boolean).join(", ");
  if (jobIsFullyRemote(job)) {
    return city ? `Remote · ${city}` : "Remote";
  }
  return city || null;
}

export function applyRemotePreferenceFilter<T extends RemoteFlagFields>(
  jobs: T[],
  preference: RemotePreference | string | null | undefined,
): T[] {
  if (preference === "remote_only") {
    return jobs.filter((j) => jobIsFullyRemote(j));
  }
  if (preference === "onsite_only") {
    return jobs.filter((j) => !jobIsFullyRemote(j));
  }
  return jobs;
}
