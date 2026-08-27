"""Chrome extension / bot sync for the marketing live-feed table.

Auth: X-Service-Secret (same as jobs ingest). Never a hardcoded body secret.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import asyncpg
import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, HttpUrl

from hireloop_api.deps import get_db, verify_service_secret

logger = structlog.get_logger()
router = APIRouter(prefix="/live-feed", tags=["live-feed"])


class JobPayload(BaseModel):
    title: str
    company: str
    location: str
    work_type: str | None = None
    salary: str | None = None
    url: HttpUrl
    tags: list[str] = Field(default_factory=list)


class SyncRequest(BaseModel):
    jobs: list[JobPayload]


@router.post("/sync")
async def sync_live_jobs(
    payload: SyncRequest,
    db: asyncpg.Connection = Depends(get_db),
    _: None = Depends(verify_service_secret),
) -> dict[str, object]:
    if not payload.jobs:
        return {"status": "ok", "inserted": 0}

    now = datetime.now(UTC)
    expires_at = now + timedelta(days=7)
    try:
        await db.executemany(
            """
            INSERT INTO public.live_feed_jobs
                (title, company, location, work_type, salary, url, tags, created_at, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9)
            """,
            [
                (
                    job.title,
                    job.company,
                    job.location,
                    job.work_type,
                    job.salary,
                    str(job.url),
                    job.tags,
                    now,
                    expires_at,
                )
                for job in payload.jobs
            ],
        )
    except Exception:
        logger.exception("live_feed_sync_failed", count=len(payload.jobs))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error",
        ) from None

    return {"status": "ok", "inserted": len(payload.jobs)}
