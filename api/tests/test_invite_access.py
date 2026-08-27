"""Unit tests for invite-only email helpers."""

from __future__ import annotations

from types import SimpleNamespace
from uuid import uuid4

import pytest

from hireloop_api.config import Settings
from hireloop_api.deps import _load_app_user
from hireloop_api.services.invite_access import (
    INVITE_PENDING_MESSAGE,
    invite_request_stats,
    is_super_admin_email,
    is_valid_email,
    normalize_email,
)


def test_normalize_email_lower_and_strip() -> None:
    assert normalize_email("  Foo@Hireschema.COM ") == "foo@hireschema.com"


def test_is_valid_email() -> None:
    assert is_valid_email("ok@example.com")
    assert not is_valid_email("not-an-email")
    assert not is_valid_email("")
    assert not is_valid_email("a@" + ("b" * 250) + ".com")


def test_is_super_admin_email() -> None:
    settings = SimpleNamespace(super_admin_emails=["Founder@Hireschema.com", "ops@hireschema.com"])
    assert is_super_admin_email(settings, "founder@hireschema.com")
    assert is_super_admin_email(settings, "Rupesh7126@gmail.com")
    assert is_super_admin_email(settings, "rratanranjeet790395@gmail.com")
    assert not is_super_admin_email(settings, "random@hireschema.com")


def test_invite_pending_message() -> None:
    assert "Thank you for requesting an invite" in INVITE_PENDING_MESSAGE
    assert "get back to you" in INVITE_PENDING_MESSAGE.lower()


class _StatsConn:
    async def fetchrow(self, query: str, *_args: object) -> dict[str, int]:
        assert "invite_requests" in query
        return {"total": 12, "pending": 7, "approved": 4, "rejected": 1}


@pytest.mark.asyncio
async def test_invite_request_stats_counts_all_statuses() -> None:
    stats = await invite_request_stats(_StatsConn())  # type: ignore[arg-type]
    assert stats == {"total": 12, "pending": 7, "approved": 4, "rejected": 1}


class _NoUserConn:
    def __init__(self) -> None:
        self.writes: list[str] = []

    async def fetchrow(self, query: str, *_args: object) -> None:
        self.writes.append(query)
        return None

    async def execute(self, query: str, *_args: object) -> str:
        self.writes.append(query)
        return "OK"


@pytest.mark.asyncio
async def test_load_app_user_does_not_auto_provision_uninvited() -> None:
    conn = _NoUserConn()
    settings = Settings(
        _env_file=None,  # type: ignore[call-arg]
        environment="test",
        supabase_url="",
        supabase_service_key="",
    )
    row = await _load_app_user(
        settings,
        conn,  # type: ignore[arg-type]
        {"id": str(uuid4()), "email": "stranger@example.com"},
    )
    assert row is None
    assert not any("INSERT INTO public.users" in q for q in conn.writes)
