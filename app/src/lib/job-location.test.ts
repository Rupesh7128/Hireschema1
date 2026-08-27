import { describe, expect, it } from "vitest";
import {
  applyRemotePreferenceFilter,
  jobIsFullyRemote,
  jobLocationLabel,
} from "./job-location";

describe("jobIsFullyRemote", () => {
  it("treats hybrid as not fully remote even when is_remote is true", () => {
    expect(jobIsFullyRemote({ is_remote: true, employment_type: "hybrid" })).toBe(false);
  });

  it("keeps flagged remote jobs without an office employment type", () => {
    expect(jobIsFullyRemote({ is_remote: true, employment_type: null })).toBe(true);
  });
});

describe("jobLocationLabel", () => {
  it("prefixes Remote so a city does not look like an office role", () => {
    expect(
      jobLocationLabel({
        location_city: "Bengaluru",
        location_state: "Karnataka",
        is_remote: true,
        employment_type: null,
      }),
    ).toBe("Remote · Bengaluru, Karnataka");
  });

  it("shows the city only for onsite roles", () => {
    expect(
      jobLocationLabel({
        location_city: "Mumbai",
        location_state: null,
        is_remote: false,
        employment_type: null,
      }),
    ).toBe("Mumbai");
  });
});

describe("applyRemotePreferenceFilter", () => {
  const jobs = [
    { job_id: "r", is_remote: true, employment_type: null },
    { job_id: "o", is_remote: false, employment_type: null },
    { job_id: "h", is_remote: true, employment_type: "hybrid" },
  ];

  it("drops onsite and hybrid when the profile is remote only", () => {
    expect(applyRemotePreferenceFilter(jobs, "remote_only").map((j) => j.job_id)).toEqual(["r"]);
  });

  it("locks the product to remote even if preference is any", () => {
    expect(applyRemotePreferenceFilter(jobs, "any").map((j) => j.job_id)).toEqual(["r"]);
  });
});
