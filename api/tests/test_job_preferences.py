"""Tests for remote / on-site job preference helpers."""

from hireloop_api.services.job_preferences import (
    REMOTE_PREFERENCE_REMOTE_ONLY,
    normalize_remote_preference,
    remote_filter_sql,
    resolve_remote_preference,
)


def test_normalize_locks_product_to_remote_only() -> None:
    assert normalize_remote_preference(None) == REMOTE_PREFERENCE_REMOTE_ONLY
    assert normalize_remote_preference("any") == REMOTE_PREFERENCE_REMOTE_ONLY
    assert normalize_remote_preference("onsite") == REMOTE_PREFERENCE_REMOTE_ONLY
    assert normalize_remote_preference("remote") == REMOTE_PREFERENCE_REMOTE_ONLY


def test_resolve_always_remote_only() -> None:
    assert (
        resolve_remote_preference(stored="any", override="onsite_only")
        == REMOTE_PREFERENCE_REMOTE_ONLY
    )
    assert (
        resolve_remote_preference(stored="remote_only", override=None)
        == REMOTE_PREFERENCE_REMOTE_ONLY
    )


def test_remote_filter_sql_is_always_remote_only() -> None:
    remote_sql = remote_filter_sql("any")
    assert "is_remote = TRUE" in remote_sql
    assert "hybrid" in remote_sql


def test_job_is_fully_remote_excludes_hybrid() -> None:
    from hireloop_api.services.job_preferences import job_is_fully_remote

    assert job_is_fully_remote({"is_remote": True}) is True
    assert job_is_fully_remote({"is_remote": True, "employment_type": "hybrid"}) is False
    assert job_is_fully_remote({"is_remote": False, "employment_type": "remote"}) is True
    assert job_is_fully_remote({"is_remote": False, "location_city": "Bengaluru"}) is False
