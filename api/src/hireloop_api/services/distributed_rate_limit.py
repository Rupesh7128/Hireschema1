"""Postgres-backed fixed-window limits for horizontally scaled public endpoints."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Literal

import asyncpg
from fastapi import HTTPException, status


def rate_limit_window_start(
    now: datetime,
    period: Literal["hour", "day"] = "hour",
) -> datetime:
    if period == "day":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    return now.replace(minute=0, second=0, microsecond=0)


async def check_distributed_rate_limit(
    db: asyncpg.Connection,
    *,
    identity_hash: str,
    bucket: str,
    max_per_hour: int,
    period: Literal["hour", "day"] = "hour",
) -> None:
    now = datetime.now(UTC)
    window_start = rate_limit_window_start(now, period)
    count = await db.fetchval(
        """
        INSERT INTO public.api_rate_limits
          (identity_hash, bucket, window_start, request_count)
        VALUES ($1, $2, $3, 1)
        ON CONFLICT (identity_hash, bucket, window_start) DO UPDATE
        SET request_count = public.api_rate_limits.request_count + 1,
            updated_at = NOW()
        RETURNING request_count
        """,
        identity_hash,
        bucket,
        window_start,
    )
    if int(count or 0) <= max_per_hour:
        return
    delta = timedelta(days=1) if period == "day" else timedelta(hours=1)
    retry_in = max(1, int((window_start + delta - now).total_seconds()))
    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail="Too many requests. Try again later.",
        headers={"Retry-After": str(retry_in)},
    )
