"""Unit tests for invite-only email helpers."""

from __future__ import annotations

from types import SimpleNamespace

from hireloop_api.services.invite_access import (
    INVITE_PENDING_MESSAGE,
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
    assert not is_super_admin_email(settings, "random@hireschema.com")


def test_invite_pending_message() -> None:
    assert "Thank you for requesting an invite" in INVITE_PENDING_MESSAGE
    assert "get back to you" in INVITE_PENDING_MESSAGE.lower()
