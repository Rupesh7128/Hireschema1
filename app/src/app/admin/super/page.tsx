"use client";

/**
 * Super admin panel — internal user management.
 *
 * Guard: enforced server-side by /admin/layout.tsx (calls /api/v1/admin/dashboard).
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, ShieldAlert, Trash2 } from "@/components/brand/icons";
import { apiFetch } from "@/lib/api/client";
import { Badge, Button, EmptyState, Input, Select } from "@/components/ui";
import {
  ADMIN_BACK,
  ADMIN_CARD,
  ADMIN_KICKER,
  ADMIN_PAGE,
  ADMIN_SUB,
  ADMIN_TABLE_WRAP,
  ADMIN_TBODY,
  ADMIN_TD,
  ADMIN_TD_META,
  ADMIN_TD_STRONG,
  ADMIN_TH,
  ADMIN_THEAD,
  ADMIN_TITLE,
  ADMIN_TR,
} from "@/lib/admin-theme";
import { cn } from "@/lib/utils";

type UserSummary = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "candidate" | "recruiter" | "admin";
  phone_verified: boolean;
  market: string | null;
  created_at: string;
  deleted_at: string | null;
  candidate_id: string | null;
  candidate_is_active: boolean | null;
  recruiter_id: string | null;
  recruiter_deleted_at: string | null;
};

type CandidateSummary = {
  id: string;
  user_id: string;
  headline: string | null;
  current_title: string | null;
  location_city: string | null;
  years_experience: number | null;
  is_active: boolean;
  deleted_at: string | null;
  user_email: string;
  user_name: string | null;
};

type RecruiterSummary = {
  id: string;
  user_id: string;
  title: string | null;
  company_id: string | null;
  deleted_at: string | null;
  user_email: string;
  user_name: string | null;
};

type Tab = "invites" | "users" | "candidates" | "recruiters";

type InviteRequest = {
  id: string;
  email: string;
  full_name: string | null;
  note: string | null;
  source: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string | null;
};

type InviteStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

const EMPTY_INVITE_STATS: InviteStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

const ROLE_OPTIONS = [
  { value: "candidate", label: "candidate" },
  { value: "recruiter", label: "recruiter" },
  { value: "admin", label: "admin" },
] as const;

export default function SuperAdminPage() {
  const [tab, setTab] = useState<Tab>("invites");
  const [q, setQ] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<"pending" | "approved" | "rejected" | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newInviteEmail, setNewInviteEmail] = useState("");

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const [recruiters, setRecruiters] = useState<RecruiterSummary[]>([]);
  const [invites, setInvites] = useState<InviteRequest[]>([]);
  const [inviteStats, setInviteStats] = useState<InviteStats>(EMPTY_INVITE_STATS);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("limit", "500");
    params.set("offset", "0");

    if (tab === "invites") {
      if (inviteStatus) params.set("status", inviteStatus);
      return `/api/v1/super-admin/invites?${params.toString()}`;
    }
    if (includeDeleted) params.set("include_deleted", "true");
    if (tab === "users") return `/api/v1/super-admin/users?${params.toString()}`;
    if (tab === "candidates") return `/api/v1/super-admin/candidates?${params.toString()}`;
    return `/api/v1/super-admin/recruiters?${params.toString()}`;
  }, [tab, q, includeDeleted, inviteStatus]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      if (tab === "invites") {
        const data = await apiFetch<{ items: InviteRequest[]; stats: InviteStats }>(endpoint);
        setInvites(data.items);
        setInviteStats(data.stats);
      } else if (tab === "users") {
        const data = await apiFetch<UserSummary[]>(endpoint);
        setUsers(data);
      } else if (tab === "candidates") {
        const data = await apiFetch<CandidateSummary[]>(endpoint);
        setCandidates(data);
      } else {
        const data = await apiFetch<RecruiterSummary[]>(endpoint);
        setRecruiters(data);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  async function updateUser(
    userId: string,
    patch: Partial<{ role: UserSummary["role"]; phone_verified: boolean; market: string }>,
  ) {
    await apiFetch<UserSummary>(`/api/v1/super-admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    await load();
  }

  async function deleteUser(userId: string) {
    const ok = window.confirm("Soft-delete this user? (DPDP purge scheduled in 30 days)");
    if (!ok) return;
    await apiFetch<{ ok: true }>(`/api/v1/super-admin/users/${userId}`, { method: "DELETE" });
    await load();
  }

  async function setCandidateActive(candidateId: string, isActive: boolean) {
    await apiFetch<CandidateSummary>(`/api/v1/super-admin/candidates/${candidateId}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    });
    await load();
  }

  async function setRecruiterEnabled(recruiterId: string, enabled: boolean) {
    await apiFetch<RecruiterSummary>(`/api/v1/super-admin/recruiters/${recruiterId}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    });
    await load();
  }

  async function setInviteRequestStatus(
    inviteId: string,
    status: InviteRequest["status"],
  ) {
    await apiFetch<InviteRequest>(`/api/v1/super-admin/invites/${inviteId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function addApprovedInvite(e: React.FormEvent) {
    e.preventDefault();
    const email = newInviteEmail.trim();
    if (!email) return;
    await apiFetch<InviteRequest>(`/api/v1/super-admin/invites`, {
      method: "POST",
      body: JSON.stringify({ email, approve: true }),
    });
    setNewInviteEmail("");
    setInviteStatus("approved");
    await load();
  }

  return (
    <main className={ADMIN_PAGE}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link href="/admin" className={cn(ADMIN_BACK, "mt-1")}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="h-5 w-5 text-accent" strokeWidth={1.5} />
                <span className={ADMIN_KICKER}>
                  Super admin
                </span>
              </div>
              <h1 className={ADMIN_TITLE}>User management</h1>
              <p className={ADMIN_SUB}>
                {loading && tab === "invites"
                  ? "All invite requests, newest first."
                  : `${inviteStats.total.toLocaleString("en-IN")} invite${inviteStats.total === 1 ? "" : "s"} received. Approve or reject from this list.`}
              </p>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={() => void load()} loading={loading}>
            Refresh
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <TabButton active={tab === "invites"} onClick={() => setTab("invites")}>
              Invites
              {inviteStats.total > 0 ? ` (${inviteStats.total})` : ""}
            </TabButton>
            <TabButton active={tab === "users"} onClick={() => setTab("users")}>
              Users
            </TabButton>
            <TabButton active={tab === "candidates"} onClick={() => setTab("candidates")}>
              Candidates
            </TabButton>
            <TabButton active={tab === "recruiters"} onClick={() => setTab("recruiters")}>
              Recruiters
            </TabButton>
          </div>

          <div className="flex-1 sm:max-w-md">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by email or name…"
            />
          </div>

          {tab === "invites" ? (
            <Select
              value={inviteStatus}
              onChange={(e) =>
                setInviteStatus(e.target.value as typeof inviteStatus)
              }
              options={[
                { value: "", label: "All requests" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
          ) : (
            <label className="flex items-center gap-2 text-small text-ink-500 select-none">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
              />
              Include deleted
            </label>
          )}
        </div>

        {tab === "invites" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(
              [
                { key: "total", label: "Received", accent: true },
                { key: "pending", label: "Pending", accent: false },
                { key: "approved", label: "Approved", accent: false },
                { key: "rejected", label: "Rejected", accent: false },
              ] as const
            ).map(({ key, label, accent }) => (
              <div
                key={key}
                className={cn(ADMIN_CARD, "p-4 space-y-2")}
              >
                <p className={ADMIN_KICKER}>{label}</p>
                <p className={`text-h2 font-semibold ${accent ? "text-accent" : "text-ink-900"}`}>
                  {loading ? "—" : inviteStats[key].toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === "invites" && (
          <form onSubmit={(e) => void addApprovedInvite(e)} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={newInviteEmail}
              onChange={(e) => setNewInviteEmail(e.target.value)}
              placeholder="Approve email directly…"
              type="email"
              className="sm:max-w-sm"
            />
            <Button type="submit" size="sm" disabled={!newInviteEmail.trim()}>
              Add & approve
            </Button>
          </form>
        )}

        {error && (
          <div className="rounded-md bg-destructive-bg border border-destructive px-4 py-3 text-destructive text-small">
            {error}
          </div>
        )}

        {/* Content */}
        {tab === "invites" && (
          <InvitesTable
            rows={invites}
            loading={loading}
            onStatus={setInviteRequestStatus}
          />
        )}
        {tab === "users" && (
          <UsersTable
            rows={users}
            loading={loading}
            onDelete={deleteUser}
            onUpdate={updateUser}
          />
        )}

        {tab === "candidates" && (
          <CandidatesTable
            rows={candidates}
            loading={loading}
            onToggleActive={setCandidateActive}
          />
        )}

        {tab === "recruiters" && (
          <RecruitersTable
            rows={recruiters}
            loading={loading}
            onToggleEnabled={setRecruiterEnabled}
          />
        )}
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3.5 h-9 rounded-full text-small font-medium transition-colors",
        active
          ? "bg-accent text-on-accent border border-accent"
          : "border border-ink-200 text-ink-500 hover:text-ink-900 hover:bg-ink-50 hover:border-ink-300"
      )}
    >
      {children}
    </button>
  );
}

function InvitesTable({
  rows,
  loading,
  onStatus,
}: {
  rows: InviteRequest[];
  loading: boolean;
  onStatus: (inviteId: string, status: InviteRequest["status"]) => Promise<void>;
}) {
  if (!loading && rows.length === 0) {
    return (
      <EmptyState
        icon={<Search strokeWidth={1.5} />}
        title="No invite requests"
        description="Pending requests will show up here."
      />
    );
  }

  return (
    <div className={ADMIN_TABLE_WRAP}>
      <table className="w-full text-small">
        <thead className={ADMIN_THEAD}>
          <tr>
            {["Email", "Name", "Note", "Source", "Status", "Requested", ""].map((h) => (
              <th
                key={h || "actions"}
                className={ADMIN_TH}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={ADMIN_TBODY}>
          {rows.map((row) => (
            <tr key={row.id} className={ADMIN_TR}>
              <td className={ADMIN_TD_STRONG}>{row.email}</td>
              <td className={ADMIN_TD}>{row.full_name ?? "—"}</td>
              <td className={cn(ADMIN_TD, "max-w-[220px] truncate")} title={row.note ?? undefined}>
                {row.note ?? "—"}
              </td>
              <td className={ADMIN_TD}>{row.source}</td>
              <td className="px-4 py-3">
                <Badge
                  tone={
                    row.status === "approved"
                      ? "accent"
                      : row.status === "rejected"
                        ? "muted"
                        : "strong"
                  }
                >
                  {row.status}
                </Badge>
              </td>
              <td className={ADMIN_TD_META}>
                {row.created_at
                  ? new Date(row.created_at).toLocaleDateString("en-IN")
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-2">
                  {row.status !== "approved" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => void onStatus(row.id, "approved")}
                    >
                      Approve
                    </Button>
                  )}
                  {row.status !== "rejected" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void onStatus(row.id, "rejected")}
                    >
                      Reject
                    </Button>
                  )}
                  {row.status !== "pending" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void onStatus(row.id, "pending")}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTable({
  rows,
  loading,
  onDelete,
  onUpdate,
}: {
  rows: UserSummary[];
  loading: boolean;
  onDelete: (userId: string) => Promise<void>;
  onUpdate: (
    userId: string,
    patch: Partial<{ role: UserSummary["role"]; phone_verified: boolean; market: string }>,
  ) => Promise<void>;
}) {
  if (!loading && rows.length === 0) {
    return (
      <EmptyState
        icon={<Search strokeWidth={1.5} />}
        title="No users"
        description="Try a different search."
      />
    );
  }

  return (
    <div className={ADMIN_TABLE_WRAP}>
      <table className="w-full text-small">
        <thead className={ADMIN_THEAD}>
          <tr>
            {["Email", "Name", "Market", "Role", "Phone", "Candidate", "Recruiter", "Created", ""].map((h) => (
              <th
                key={h}
                className={ADMIN_TH}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={ADMIN_TBODY}>
          {rows.map((u) => (
            <tr key={u.id} className={ADMIN_TR}>
              <td className={ADMIN_TD_STRONG}>{u.email}</td>
              <td className={ADMIN_TD}>{u.full_name ?? "—"}</td>
              <td className={ADMIN_TD}>{u.market ?? "—"}</td>
              <td className="px-4 py-3">
                <Select
                  value={u.role}
                  options={ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  className="h-9 py-0 px-3"
                  onChange={(e) => void onUpdate(u.id, { role: e.target.value as UserSummary["role"] })}
                />
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => void onUpdate(u.id, { phone_verified: !u.phone_verified })}
                  className={cn(
                    "px-2.5 py-1 text-micro font-semibold border transition-colors",
                    u.phone_verified
                      ? "bg-ink-50 border-ink-200 text-ink-900 hover:bg-ink-100"
                      : "bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/15"
                  )}
                >
                  {u.phone_verified ? "Verified" : "Not verified"}
                </button>
              </td>
              <td className="px-4 py-3">
                {u.candidate_id ? (
                  <Badge tone={u.candidate_is_active ? "accent" : "muted"}>
                    {u.candidate_is_active ? "Active" : "Paused"}
                  </Badge>
                ) : (
                  <span className="text-ink-500">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {u.recruiter_id ? (
                  <Badge tone={u.recruiter_deleted_at ? "muted" : "accent"}>
                    {u.recruiter_deleted_at ? "Disabled" : "Enabled"}
                  </Badge>
                ) : (
                  <span className="text-ink-500">—</span>
                )}
              </td>
              <td className={ADMIN_TD_META}>
                {new Date(u.created_at).toLocaleDateString("en-IN")}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => void onDelete(u.id)}
                  className="inline-flex items-center gap-1.5 text-destructive hover:text-red-300 transition-colors"
                  title="Soft delete"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CandidatesTable({
  rows,
  loading,
  onToggleActive,
}: {
  rows: CandidateSummary[];
  loading: boolean;
  onToggleActive: (candidateId: string, active: boolean) => Promise<void>;
}) {
  if (!loading && rows.length === 0) {
    return (
      <EmptyState
        icon={<Search strokeWidth={1.5} />}
        title="No candidates"
        description="Try a different search."
      />
    );
  }

  return (
    <div className={ADMIN_TABLE_WRAP}>
      <table className="w-full text-small">
        <thead className={ADMIN_THEAD}>
          <tr>
            {["Email", "Name", "Title", "City", "Exp", "Status", ""].map((h) => (
              <th
                key={h}
                className={ADMIN_TH}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={ADMIN_TBODY}>
          {rows.map((c) => (
            <tr key={c.id} className={ADMIN_TR}>
              <td className={ADMIN_TD_STRONG}>{c.user_email}</td>
              <td className={ADMIN_TD}>{c.user_name ?? "—"}</td>
              <td className={ADMIN_TD}>{c.current_title ?? c.headline ?? "—"}</td>
              <td className={ADMIN_TD}>{c.location_city ?? "—"}</td>
              <td className={ADMIN_TD}>
                {c.years_experience != null ? `${c.years_experience}y` : "—"}
              </td>
              <td className="px-4 py-3">
                <Badge tone={c.is_active ? "accent" : "muted"}>
                  {c.is_active ? "Active" : "Paused"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant={c.is_active ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => void onToggleActive(c.id, !c.is_active)}
                >
                  {c.is_active ? "Pause" : "Activate"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecruitersTable({
  rows,
  loading,
  onToggleEnabled,
}: {
  rows: RecruiterSummary[];
  loading: boolean;
  onToggleEnabled: (recruiterId: string, enabled: boolean) => Promise<void>;
}) {
  if (!loading && rows.length === 0) {
    return (
      <EmptyState
        icon={<Search strokeWidth={1.5} />}
        title="No recruiters"
        description="Try a different search."
      />
    );
  }

  return (
    <div className={ADMIN_TABLE_WRAP}>
      <table className="w-full text-small">
        <thead className={ADMIN_THEAD}>
          <tr>
            {["Email", "Name", "Title", "Company", "Status", ""].map((h) => (
              <th
                key={h}
                className={ADMIN_TH}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={ADMIN_TBODY}>
          {rows.map((r) => {
            const enabled = !r.deleted_at;
            return (
              <tr key={r.id} className={ADMIN_TR}>
                <td className={ADMIN_TD_STRONG}>{r.user_email}</td>
                <td className={ADMIN_TD}>{r.user_name ?? "—"}</td>
                <td className={ADMIN_TD}>{r.title ?? "—"}</td>
                <td className={ADMIN_TD}>
                  {r.company_id ? r.company_id.slice(0, 8) + "…" : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={enabled ? "accent" : "muted"}>
                    {enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant={enabled ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => void onToggleEnabled(r.id, !enabled)}
                  >
                    {enabled ? "Disable" : "Enable"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
