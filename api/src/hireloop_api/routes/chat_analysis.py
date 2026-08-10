"""Chat analysis endpoints — resume / JD fit for candidates."""

from __future__ import annotations

import json
import uuid
from typing import Any

import asyncpg
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from hireloop_api.deps import get_db, get_phone_verified_user
from hireloop_api.services.chat_analysis import (
    analyze_jd_vs_profile,
    analyze_resume_parsed,
    looks_like_jd,
)

router = APIRouter(tags=["chat-analysis"])


class AnalyzeJdRequest(BaseModel):
    jd_text: str = Field(min_length=40, max_length=40_000)
    job_id: str | None = None


def _parsed_from_row(row: asyncpg.Record | None) -> dict[str, Any]:
    if not row:
        return {}
    raw = row.get("parsed_data")
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            raw = {}
    if isinstance(raw, dict):
        return dict(raw)
    return {}


async def _candidate_profile(db: asyncpg.Connection, user_id: uuid.UUID) -> dict[str, Any] | None:
    cand = await db.fetchrow(
        """
        SELECT c.current_title, c.current_company, c.years_experience, c.skills,
               c.notice_period_days, c.expected_ctc_min, c.expected_ctc_max, c.current_ctc,
               c.location_city, c.location_state, c.headline, c.looking_for,
               u.full_name
        FROM public.candidates c
        JOIN public.users u ON u.id = c.user_id
        WHERE c.user_id = $1::uuid AND c.deleted_at IS NULL
        """,
        user_id,
    )
    return dict(cand) if cand else None


@router.post("/me/chat/analyze-resume")
async def analyze_my_resume(
    current_user: dict = Depends(get_phone_verified_user),
    db: asyncpg.Connection = Depends(get_db),
) -> dict[str, Any]:
    """Analyse the candidate's latest uploaded resume for chat cards."""
    user_id = uuid.UUID(str(current_user["id"]))
    rows = await db.fetch(
        """
        SELECT r.id, r.parsed_data, r.created_at
        FROM public.resumes r
        JOIN public.candidates c ON c.id = r.candidate_id AND c.deleted_at IS NULL
        WHERE c.user_id = $1::uuid
        ORDER BY r.created_at DESC
        LIMIT 2
        """,
        user_id,
    )
    profile = await _candidate_profile(db, user_id)
    if not rows:
        if not profile:
            raise HTTPException(404, "No resume or candidate profile found")
        analysis = analyze_resume_parsed(profile)
        analysis["resume_id"] = None
        return analysis

    latest = _parsed_from_row(rows[0])
    previous = _parsed_from_row(rows[1]) if len(rows) > 1 else None
    if profile:
        for key, val in profile.items():
            if latest.get(key) in (None, "", [], {}):
                latest[key] = val

    analysis = analyze_resume_parsed(latest, previous=previous or None)
    analysis["resume_id"] = str(rows[0]["id"])
    return analysis


@router.post("/me/chat/analyze-jd")
async def analyze_pasted_jd(
    body: AnalyzeJdRequest,
    current_user: dict = Depends(get_phone_verified_user),
    db: asyncpg.Connection = Depends(get_db),
) -> dict[str, Any]:
    """Score a pasted JD against the candidate profile."""
    user_id = uuid.UUID(str(current_user["id"]))
    if not looks_like_jd(body.jd_text) and len(body.jd_text) < 120:
        raise HTTPException(400, "Paste a fuller job description to analyse.")

    profile = await _candidate_profile(db, user_id)
    if not profile:
        raise HTTPException(404, "Candidate profile not found")

    analysis = analyze_jd_vs_profile(body.jd_text, profile, job_id=body.job_id)
    analysis["looks_like_jd"] = looks_like_jd(body.jd_text)
    return analysis
