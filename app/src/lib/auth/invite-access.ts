/**
 * Thrown when bootstrap blocks a new account that is not invite-approved.
 * Caller should sign the user out and send them to the thank-you invite page.
 */
export class InviteAccessError extends Error {
  readonly code: "invite_pending" | "invite_rejected" | "invite_required";
  readonly inviteStatus: "pending" | "approved" | "rejected";

  constructor(
    message: string,
    code: InviteAccessError["code"] = "invite_pending",
    inviteStatus: InviteAccessError["inviteStatus"] = "pending",
  ) {
    super(message);
    this.name = "InviteAccessError";
    this.code = code;
    this.inviteStatus = inviteStatus;
  }
}

export function inviteThanksUrl(
  status: InviteAccessError["inviteStatus"] = "pending",
): string {
  const qs = new URLSearchParams();
  qs.set("thanks", "1");
  qs.set("status", status);
  return `/invite?${qs.toString()}`;
}

export function parseInviteAccessDetail(
  detail: unknown,
): InviteAccessError | null {
  if (!detail) return null;

  if (typeof detail === "string") {
    const lowered = detail.toLowerCase();
    if (lowered.includes("invite-only") || lowered.includes("request an invite")) {
      return new InviteAccessError(
        "Thank you for requesting an invite. We'll get back to you.",
        "invite_pending",
        "pending",
      );
    }
    return null;
  }

  if (typeof detail !== "object") return null;
  const obj = detail as {
    code?: string;
    message?: string;
    status?: string;
  };
  const code = obj.code;
  if (
    code !== "invite_pending" &&
    code !== "invite_rejected" &&
    code !== "invite_required"
  ) {
    return null;
  }
  const inviteStatus =
    obj.status === "rejected" || obj.status === "approved" || obj.status === "pending"
      ? obj.status
      : code === "invite_rejected"
        ? "rejected"
        : "pending";
  return new InviteAccessError(
    obj.message ||
      (inviteStatus === "rejected"
        ? "This invite request was declined. Contact hello@hireschema.com if that seems wrong."
        : "Thank you for requesting an invite. We'll get back to you."),
    code,
    inviteStatus === "approved" ? "pending" : inviteStatus,
  );
}
