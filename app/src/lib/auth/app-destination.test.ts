import { describe, expect, it } from "vitest";
import {
  classifySignedInGate,
  resolveSignedInPath,
} from "@/lib/auth/app-destination";

describe("classifySignedInGate", () => {
  it("treats API onboarding_complete as complete", () => {
    expect(
      classifySignedInGate(200, { candidate: { onboarding_complete: true } }),
    ).toEqual({ kind: "complete" });
  });

  it("treats missing or false onboarding_complete as incomplete", () => {
    expect(classifySignedInGate(200, { candidate: null })).toEqual({
      kind: "incomplete",
    });
    expect(
      classifySignedInGate(200, { candidate: { onboarding_complete: false } }),
    ).toEqual({ kind: "incomplete" });
    expect(classifySignedInGate(200, { user: { id: "x" } })).toEqual({
      kind: "incomplete",
    });
  });

  it("maps invite 403 to the thank-you invite URL", () => {
    expect(
      classifySignedInGate(403, {
        detail: { code: "invite_required", status: "pending" },
      }),
    ).toEqual({
      kind: "invite",
      invitePath: "/invite?thanks=1&status=pending",
    });
    expect(
      classifySignedInGate(403, {
        detail: { code: "invite_rejected", status: "rejected" },
      }),
    ).toEqual({
      kind: "invite",
      invitePath: "/invite?thanks=1&status=rejected",
    });
  });

  it("maps india_only 403 to the India waitlist", () => {
    expect(
      classifySignedInGate(403, {
        detail: { error_code: "india_only" },
      }),
    ).toEqual({
      kind: "invite",
      invitePath: "/invite?reason=india",
    });
  });

  it("treats transport / 5xx / 401 as unknown so pages stay put", () => {
    expect(classifySignedInGate(0, null)).toEqual({ kind: "unknown" });
    expect(classifySignedInGate(401, { detail: "User not found" })).toEqual({
      kind: "unknown",
    });
    expect(classifySignedInGate(500, { detail: "boom" })).toEqual({
      kind: "unknown",
    });
  });
});

describe("resolveSignedInPath — no dashboard ↔ onboarding loop", () => {
  it("sends complete users to dashboard from either page", () => {
    const gate = { kind: "complete" as const };
    expect(resolveSignedInPath("/dashboard", gate)).toBe("/dashboard");
    expect(resolveSignedInPath("/onboarding", gate)).toBe("/dashboard");
  });

  it("keeps incomplete users on onboarding (never bounces back to dashboard)", () => {
    const gate = { kind: "incomplete" as const };
    expect(resolveSignedInPath("/dashboard", gate)).toBe("/onboarding");
    expect(resolveSignedInPath("/onboarding", gate)).toBe("/onboarding");
  });

  it("sends invite-required to /invite instead of dashboard/onboarding ping-pong", () => {
    const gate = {
      kind: "invite" as const,
      invitePath: "/invite?thanks=1&status=pending",
    };
    expect(resolveSignedInPath("/dashboard", gate)).toBe(
      "/invite?thanks=1&status=pending",
    );
    expect(resolveSignedInPath("/onboarding", gate)).toBe(
      "/invite?thanks=1&status=pending",
    );
  });

  it("stays on the current page when the API is unknown (missing users row must not loop)", () => {
    const gate = { kind: "unknown" as const };
    expect(resolveSignedInPath("/dashboard", gate)).toBe("/dashboard");
    expect(resolveSignedInPath("/onboarding", gate)).toBe("/onboarding");
  });
});
