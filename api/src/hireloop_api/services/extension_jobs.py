"""Upsert external job pages into jobs + saved_jobs for the Chrome extension."""

from __future__ import annotations

import re
import uuid
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import asyncpg
from fastapi import HTTPException

from hireloop_api.market_db import fetch_candidate_market
from hireloop_api.services.job_pipeline import ensure_saved_job

_TRACKING_QUERY_KEYS = {
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "fbclid",
    "gclid",
    "li_fat_id",
    "mc_cid",
    "mc_eid",
    "refId",
    "refid",
}


def normalize_job_url(url: str) -> str:
    raw = (url or "").strip()
    parsed = urlparse(raw)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise HTTPException(status_code=422, detail="url must be an http(s) URL")
    # Drop fragments and common tracking params so LinkedIn share links dedupe.
    query_pairs = [
        (k, v)
        for k, v in parse_qsl(parsed.query, keep_blank_values=True)
        if k not in _TRACKING_QUERY_KEYS and not k.lower().startswith("utm_")
    ]
    clean = parsed._replace(
        scheme=parsed.scheme.lower(),
        netloc=parsed.netloc.lower(),
        path=parsed.path.rstrip("/") or "/",
        params="",
        query=urlencode(query_pairs),
        fragment="",
    )
    out = urlunparse(clean)
    if len(out) > 2000:
        raise HTTPException(status_code=422, detail="url is too long")
    return out


def _parse_location(location: str | None) -> tuple[str | None, str | None, bool]:
    if not location or not location.strip():
        return None, None, False
    text = location.strip()
    lower = text.lower()
    is_remote = any(token in lower for token in ("remote", "anywhere", "work from home", "wfh"))
    # "Bengaluru, Karnataka, India" → city/state heuristic
    parts = [p.strip() for p in re.split(r"[,|/]", text) if p.strip()]
    city = parts[0] if parts else None
    state = parts[1] if len(parts) > 1 else None
    if city and city.lower() in ("remote", "anywhere"):
        city = None
        is_remote = True
    return city, state, is_remote


async def _ensure_company(
    db: asyncpg.Connection,
    *,
    name: str | None,
    country_code: str,
) -> uuid.UUID | None:
    if not name or not name.strip():
        return None
    key = name.strip()
    existing = await db.fetchrow(
        """
        SELECT id FROM public.companies
        WHERE LOWER(name) = LOWER($1) AND deleted_at IS NULL
        LIMIT 1
        """,
        key,
    )
    if existing:
        return existing["id"]
    company_id = uuid.uuid4()
    await db.execute(
        """
        INSERT INTO public.companies (id, name, country_code)
        VALUES ($1::uuid, $2, $3)
        ON CONFLICT DO NOTHING
        """,
        company_id,
        key[:200],
        country_code,
    )
    row = await db.fetchrow(
        """
        SELECT id FROM public.companies
        WHERE LOWER(name) = LOWER($1) AND deleted_at IS NULL
        LIMIT 1
        """,
        key,
    )
    return row["id"] if row else company_id


async def save_external_job_for_candidate(
    db: asyncpg.Connection,
    *,
    user_id: str,
    title: str,
    url: str,
    company: str | None = None,
    location: str | None = None,
    source_host: str | None = None,
    description_snippet: str | None = None,
    app_base_url: str,
) -> dict[str, Any]:
    candidate = await db.fetchrow(
        "SELECT id FROM public.candidates WHERE user_id = $1::uuid AND deleted_at IS NULL",
        uuid.UUID(user_id),
    )
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    candidate_id: uuid.UUID = candidate["id"]
    canonical_url = normalize_job_url(url)
    clean_title = (title or "").strip()
    if len(clean_title) < 2:
        raise HTTPException(status_code=422, detail="title is required")
    if len(clean_title) > 300:
        clean_title = clean_title[:300]

    market = await fetch_candidate_market(db, candidate_id)
    country_code = (market or "IN").upper()[:2]
    city, state, is_remote = _parse_location(location)

    existing = await db.fetchrow(
        """
        SELECT id FROM public.jobs
        WHERE apply_url = $1
          AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
        """,
        canonical_url,
    )

    if existing:
        job_id: uuid.UUID = existing["id"]
        created = False
    else:
        company_id = await _ensure_company(db, name=company, country_code=country_code)
        job_id = uuid.uuid4()
        host = (source_host or urlparse(canonical_url).netloc or "extension")[:120]
        snippet = (description_snippet or "").strip()[:4000] or None
        desc_parts = []
        if snippet:
            desc_parts.append(snippet)
        desc_parts.append(f"Saved via Chrome extension from {host}.")
        await db.execute(
            """
            INSERT INTO public.jobs (
              id, company_id, title, description,
              location_city, location_state, country_code, is_remote,
              apply_url, source, is_active, raw_data
            ) VALUES (
              $1::uuid, $2::uuid, $3, $4,
              $5, $6, $7, $8,
              $9, 'manual', TRUE,
              $10::jsonb
            )
            """,
            job_id,
            company_id,
            clean_title,
            "\n\n".join(desc_parts),
            city,
            state,
            country_code,
            is_remote,
            canonical_url,
            {
                "origin": "chrome_extension",
                "source_host": host,
                "original_location": location,
                "company_name": company,
            },
        )
        created = True

    await ensure_saved_job(db, candidate_id, job_id)

    base = app_base_url.rstrip("/")
    tracker_url = f"{base}/dashboard?panel=jobs&tab=saved"

    return {
        "job_id": str(job_id),
        "title": title,
        "company": company,
        "saved": True,
        "created": created,
        "apply_url": canonical_url,
        "tracker_url": tracker_url,
    }
