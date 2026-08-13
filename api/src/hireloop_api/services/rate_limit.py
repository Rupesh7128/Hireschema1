"""
Per-user rate limiting for LLM-spending endpoints (backend plan #48).

Uses Postgres `api_rate_limits` when a DB connection is provided so limits are
cluster-wide across API replicas. Falls back to an in-process sliding window
when `db` is None (unit tests / emergency).
"""

from __future__ import annotations

import hashlib
import time
from collections import defaultdict, deque
from typing import Literal

import asyncpg
import structlog
from fastapi import HTTPException, status

from hireloop_api.services.distributed_rate_limit import check_distributed_rate_limit

logger = structlog.get_logger()

Period = Literal["hour", "day"]

_WINDOW_SECONDS: dict[Period, int] = {"hour": 3600, "day": 86400}

# (user_id, bucket) → deque of event timestamps inside the window.
_events: dict[tuple[str, str], deque[float]] = defaultdict(deque)


def _user_identity_hash(user_id: str) -> str:
    return hashlib.sha256(f"user:{user_id}".encode()).hexdigest()


def _limit_detail(period: Period, max_events: int, retry_in: int) -> str:
    if period == "day":
        return f"You've used today's chat limit ({max_events} turns). Try again tomorrow."
    minutes = max(1, retry_in // 60)
    return f"You've hit the hourly limit for this action — try again in about {minutes} min."


def _check_in_memory(
    user_id: str,
    bucket: str,
    max_per_hour: int,
    *,
    now: float | None = None,
    period: Period = "hour",
) -> None:
    ts = now if now is not None else time.time()
    window = _WINDOW_SECONDS[period]
    q = _events[(user_id, bucket)]
    cutoff = ts - window
    while q and q[0] <= cutoff:
        q.popleft()
    if len(q) >= max_per_hour:
        retry_in = int(q[0] + window - ts) + 1
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=_limit_detail(period, max_per_hour, retry_in),
            headers={"Retry-After": str(retry_in)},
        )
    q.append(ts)


async def check_rate_limit(
    user_id: str,
    bucket: str,
    max_per_hour: int,
    *,
    db: asyncpg.Connection | None = None,
    now: float | None = None,
    period: Period = "hour",
) -> None:
    """
    Record one event and raise 429 when the caller exceeds `max_per_hour`
    in the chosen window. Prefer Postgres when `db` is provided.
    """
    if db is not None:
        try:
            # When the caller owns an outer transaction asyncpg creates a
            # savepoint here. A missing table or transient statement error must
            # roll back that failed statement before the in-memory fallback;
            # otherwise PostgreSQL leaves the caller transaction aborted.
            async with db.transaction():
                await check_distributed_rate_limit(
                    db,
                    identity_hash=_user_identity_hash(user_id),
                    bucket=bucket,
                    max_per_hour=max_per_hour,
                    period=period,
                )
            return
        except HTTPException:
            raise
        except Exception as exc:
            # Table missing / DB flaky — degrade to in-memory rather than 500.
            logger.warning(
                "distributed_rate_limit_fallback",
                bucket=bucket,
                error=str(exc)[:200],
            )
    _check_in_memory(user_id, bucket, max_per_hour, now=now, period=period)


def reset_rate_limits() -> None:
    """Test helper — clear all in-memory counters."""
    _events.clear()
