"""India-only marketplace: currency, job visibility, geo gate, chat caps."""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException
from starlette.requests import Request

from hireloop_api.config import Settings
from hireloop_api.india_geo import (
    client_country,
    is_india_geo_exempt,
    should_enforce_india_geo,
)
from hireloop_api.markets import job_visible_for_market_sql, remote_allowed_regions
from hireloop_api.services.display_currency import (
    VALID_DISPLAY_CURRENCIES,
    resolve_display_currency,
)
from hireloop_api.services.distributed_rate_limit import rate_limit_window_start
from hireloop_api.services.rate_limit import check_rate_limit, reset_rate_limits


def _request(headers: dict[str, str]) -> Request:
    return Request(
        {
            "type": "http",
            "asgi": {"version": "3.0"},
            "http_version": "1.1",
            "method": "GET",
            "scheme": "http",
            "path": "/api/v1/chat/sessions",
            "raw_path": b"/api/v1/chat/sessions",
            "query_string": b"",
            "headers": [(k.lower().encode(), v.encode()) for k, v in headers.items()],
            "client": ("127.0.0.1", 123),
            "server": ("test", 80),
        }
    )


def test_display_currency_is_inr_only() -> None:
    assert VALID_DISPLAY_CURRENCIES == frozenset({"auto", "INR"})
    assert resolve_display_currency("USD") == "INR"
    assert resolve_display_currency("auto", market="IN") == "INR"
    assert resolve_display_currency("GBP", location_city="London") == "INR"


def test_remote_jobs_are_tagged_in_not_world() -> None:
    assert remote_allowed_regions() == ["IN"]
    sql = job_visible_for_market_sql(market_param="$1")
    assert "WORLD" not in sql
    assert "allowed_regions IS NOT NULL" in sql
    assert "$1 = ANY" in sql


def test_geo_exempt_paths() -> None:
    assert is_india_geo_exempt("/api/v1/health")
    assert is_india_geo_exempt("/api/v1/health/ready")
    assert is_india_geo_exempt("/api/v1/markets")
    assert is_india_geo_exempt("/api/v1/public/invite-request")
    assert is_india_geo_exempt("/api/v1/webhooks/msg91-whatsapp")
    assert not is_india_geo_exempt("/api/v1/chat/sessions")
    assert not is_india_geo_exempt("/api/v1/public/review-cv")


def test_geo_enforcement_defaults() -> None:
    prod = Settings(
        _env_file=None,  # type: ignore[call-arg]
        environment="production",
        secret_key="test-secret-key-not-for-prod",
        service_secret="test-service-secret-value",
        require_india_geo=None,
    )
    dev = Settings(
        _env_file=None,  # type: ignore[call-arg]
        environment="development",
        require_india_geo=None,
    )
    bypass = Settings(
        _env_file=None,  # type: ignore[call-arg]
        environment="production",
        secret_key="test-secret-key-not-for-prod",
        service_secret="test-service-secret-value",
        require_india_geo=False,
    )
    assert should_enforce_india_geo(prod) is True
    assert should_enforce_india_geo(dev) is False
    assert should_enforce_india_geo(bypass) is False


def test_client_country_from_cdn_headers() -> None:
    assert client_country(_request({"cf-ipcountry": "IN"})) == "IN"
    assert client_country(_request({"x-vercel-ip-country": "US"})) == "US"
    assert client_country(_request({"cf-ipcountry": "XX"})) is None
    assert client_country(_request({})) is None


def test_daily_window_starts_at_utc_midnight() -> None:
    now = datetime(2026, 8, 13, 16, 40, tzinfo=UTC)
    day = rate_limit_window_start(now, "day")
    hour = rate_limit_window_start(now, "hour")
    assert day.hour == 0 and day.minute == 0
    assert hour.hour == 16 and hour.minute == 0


@pytest.mark.asyncio
async def test_daily_chat_cap_blocks_after_max() -> None:
    reset_rate_limits()
    uid = "user-india-cap"
    for _ in range(20):
        await check_rate_limit(uid, "chat_turn_day", max_per_hour=20, period="day")
    with pytest.raises(HTTPException) as exc:
        await check_rate_limit(uid, "chat_turn_day", max_per_hour=20, period="day")
    assert exc.value.status_code == 429
    assert "today" in str(exc.value.detail).lower()


@pytest.mark.asyncio
async def test_distributed_daily_limit_uses_day_period() -> None:
    from hireloop_api.services.distributed_rate_limit import check_distributed_rate_limit

    db = AsyncMock()
    db.fetchval.side_effect = [2, 3]
    await check_distributed_rate_limit(
        db,
        identity_hash="digest",
        bucket="chat_turn_day",
        max_per_hour=2,
        period="day",
    )
    with pytest.raises(HTTPException) as exc:
        await check_distributed_rate_limit(
            db,
            identity_hash="digest",
            bucket="chat_turn_day",
            max_per_hour=2,
            period="day",
        )
    assert exc.value.status_code == 429
    window = db.fetchval.call_args.args[3]
    assert window.hour == 0
