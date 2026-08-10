"""Invite-only access — waitlist + email allowlist checks."""

from __future__ import annotations

import re
from typing import Any

import asyncpg

from hireloop_api.config import Settings

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def normalize_email(email: str) -> str:
    return email.strip().lower()


def is_valid_email(email: str) -> bool:
    clean = normalize_email(email)
    return bool(clean) and len(clean) <= 254 and bool(_EMAIL_RE.fullmatch(clean))


def is_super_admin_email(settings: Settings, email: str) -> bool:
    clean = normalize_email(email)
    allowed = {normalize_email(e) for e in (settings.super_admin_emails or []) if e}
    return bool(clean) and clean in allowed


async def is_email_invite_approved(
    db: asyncpg.Connection,
    *,
    email: str,
) -> bool:
    row = await db.fetchval(
        """
        SELECT 1
        FROM public.invite_requests
        WHERE lower(email) = lower($1)
          AND status = 'approved'
        LIMIT 1
        """,
        normalize_email(email),
    )
    return bool(row)


async def can_bootstrap_new_user(
    db: asyncpg.Connection,
    settings: Settings,
    *,
    email: str | None,
) -> bool:
    """Returning users are gated elsewhere; this is for brand-new accounts only."""
    if not email or not is_valid_email(email):
        return False
    if is_super_admin_email(settings, email):
        return True
    return await is_email_invite_approved(db, email=email)


INVITE_PENDING_MESSAGE = (
    "Thank you for requesting an invite. We'll get back to you."
)
INVITE_REJECTED_MESSAGE = (
    "This invite request was declined. Contact hello@hireschema.com if that seems wrong."
)


async def enforce_invite_for_new_user(
    db: asyncpg.Connection,
    settings: Settings,
    *,
    email: str | None,
    source: str = "signin_attempt",
) -> dict[str, str] | None:
    """
    If a brand-new account may bootstrap, return None.
    Otherwise enqueue/refresh an invite request and return a client-facing payload.
    """
    if await can_bootstrap_new_user(db, settings, email=email):
        return None

    clean = normalize_email(email or "")
    if not is_valid_email(clean):
        return {
            "code": "invite_required",
            "status": "pending",
            "message": INVITE_PENDING_MESSAGE,
        }

    result = await request_invite(
        db,
        email=clean,
        source=source,
    )
    status = str(result.get("status") or "pending")
    if status == "approved":
        # Race: approved between checks — allow bootstrap.
        return None
    if status == "rejected":
        return {
            "code": "invite_rejected",
            "status": "rejected",
            "message": INVITE_REJECTED_MESSAGE,
        }
    return {
        "code": "invite_pending",
        "status": "pending",
        "message": INVITE_PENDING_MESSAGE,
    }


async def request_invite(
    db: asyncpg.Connection,
    *,
    email: str,
    full_name: str | None = None,
    note: str | None = None,
    source: str = "web",
) -> dict[str, Any]:
    clean = normalize_email(email)
    if not is_valid_email(clean):
        raise ValueError("Enter a valid email address.")

    name = (full_name or "").strip()[:120] or None
    note_clean = (note or "").strip()[:500] or None
    src = (source or "web").strip()[:40] or "web"

    existing = await db.fetchrow(
        """
        SELECT id::text AS id, status, email
        FROM public.invite_requests
        WHERE lower(email) = lower($1)
        LIMIT 1
        """,
        clean,
    )
    if existing:
        return {
            "id": existing["id"],
            "email": existing["email"],
            "status": existing["status"],
            "already_exists": True,
            "message": (
                "You're already on the list — we'll email you when approved."
                if existing["status"] == "pending"
                else (
                    "You're approved — sign in with this email."
                    if existing["status"] == "approved"
                    else "This request was declined. Contact us if that seems wrong."
                )
            ),
        }

    row = await db.fetchrow(
        """
        INSERT INTO public.invite_requests (email, full_name, note, source, status)
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING id::text AS id, email, status
        """,
        clean,
        name,
        note_clean,
        src,
    )
    return {
        "id": row["id"],
        "email": row["email"],
        "status": row["status"],
        "already_exists": False,
        "message": "Thanks — you're on the invite list. We'll email you when approved.",
    }


async def list_invite_requests(
    db: asyncpg.Connection,
    *,
    status: str | None = None,
    q: str | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[dict[str, Any]]:
    where = ["1=1"]
    params: list[object] = []
    idx = 1
    if status in {"pending", "approved", "rejected"}:
        where.append(f"status = ${idx}")
        params.append(status)
        idx += 1
    if q and q.strip():
        where.append(f"(email ILIKE ${idx} OR full_name ILIKE ${idx})")
        params.append(f"%{q.strip()}%")
        idx += 1
    params.extend([limit, offset])
    rows = await db.fetch(
        f"""
        SELECT
          id::text AS id,
          email,
          full_name,
          note,
          source,
          status,
          reviewed_by::text AS reviewed_by,
          reviewed_at,
          created_at,
          updated_at
        FROM public.invite_requests
        WHERE {" AND ".join(where)}
        ORDER BY
          CASE status
            WHEN 'pending' THEN 0
            WHEN 'approved' THEN 1
            ELSE 2
          END,
          created_at DESC
        LIMIT ${idx} OFFSET ${idx + 1}
        """,
        *params,
    )
    out: list[dict[str, Any]] = []
    for row in rows:
        item = dict(row)
        for key in ("reviewed_at", "created_at", "updated_at"):
            val = item.get(key)
            item[key] = val.isoformat() if val is not None else None
        out.append(item)
    return out


async def set_invite_status(
    db: asyncpg.Connection,
    *,
    invite_id: str,
    status: str,
    reviewer_user_id: str,
) -> dict[str, Any] | None:
    if status not in {"pending", "approved", "rejected"}:
        raise ValueError("Invalid status")
    row = await db.fetchrow(
        """
        UPDATE public.invite_requests
        SET status = $2,
            reviewed_by = $3::uuid,
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING
          id::text AS id,
          email,
          full_name,
          note,
          source,
          status,
          reviewed_by::text AS reviewed_by,
          reviewed_at,
          created_at,
          updated_at
        """,
        invite_id,
        status,
        reviewer_user_id,
    )
    if not row:
        return None
    item = dict(row)
    for key in ("reviewed_at", "created_at", "updated_at"):
        val = item.get(key)
        item[key] = val.isoformat() if val is not None else None
    return item
