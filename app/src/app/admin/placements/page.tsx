"use client";

/**
 * Admin / Hires — invite-only product, no payments.
 * Records hired candidates (CTC for context, not invoices).
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Clock } from "@/components/brand/icons";
import { apiFetch } from "@/lib/api/client";
import { Badge, EmptyState } from "@/components/ui";
import {
  ADMIN_BACK,
  ADMIN_NOTE,
  ADMIN_PAGE,
  ADMIN_SKELETON,
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

type Placement = {
  id: string;
  candidate_name: string;
  role_title: string;
  company_name: string;
  status: "pending" | "confirmed" | "invoiced" | "paid";
  placed_at: string;
  ctc_inr?: number;
};

const STATUS_BADGE: Record<
  Placement["status"],
  { tone: "muted" | "strong" | "accent"; label: string }
> = {
  pending:   { tone: "muted",   label: "Pending"   },
  confirmed: { tone: "strong",  label: "Confirmed" },
  invoiced:  { tone: "accent",  label: "Hired"     },
  paid:      { tone: "accent",  label: "Hired"     },
};

export default function AdminPlacementsPage() {
  const [rows, setRows]     = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Placement[]>("/api/v1/admin/placements")
      .then((r) => { setRows(r); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <main className={ADMIN_PAGE}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className={ADMIN_BACK}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className={ADMIN_TITLE}>Hires</h1>
            <p className={ADMIN_SUB}>
              Candidates marked hired. No payments in this product — access is invite-only.
            </p>
          </div>
        </div>

        {error && (
          <div className="text-destructive text-small bg-destructive-bg rounded-md px-4 py-3">
            {error}
          </div>
        )}

        {/* Table */}
        {!loading && rows.length === 0 && (
          <EmptyState
            icon={<CheckCircle strokeWidth={1.5} />}
            title="No placements yet"
            description="When a recruiter marks a candidate as hired, the record appears here."
          />
        )}

        {rows.length > 0 && (
          <div className={ADMIN_TABLE_WRAP}>
            <table className="w-full text-small">
              <thead className={ADMIN_THEAD}>
                <tr>
                  {["Candidate", "Role", "Company", "CTC (INR)", "Date", "Status"].map((h) => (
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
                  const meta = STATUS_BADGE[r.status] ?? STATUS_BADGE.pending;
                  return (
                    <tr key={r.id} className={ADMIN_TR}>
                      <td className={ADMIN_TD_STRONG}>
                        {r.candidate_name}
                      </td>
                      <td className={ADMIN_TD}>{r.role_title}</td>
                      <td className={ADMIN_TD}>{r.company_name}</td>
                      <td className={ADMIN_TD_STRONG}>
                        {r.ctc_inr
                          ? `₹${(r.ctc_inr / 100000).toFixed(1)}L`
                          : <span className="text-ink-500">—</span>}
                      </td>
                      <td className={ADMIN_TD_META}>
                        {new Date(r.placed_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={ADMIN_SKELETON}
              />
            ))}
          </div>
        )}

        {/* Note */}
        <div className={ADMIN_NOTE}>
          <Clock className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} />
          <p>
            Hireschema is invite-only and has no in-app payments. This list is a
            hire log only — not invoices or checkout.
          </p>
        </div>

      </div>
    </main>
  );
}
