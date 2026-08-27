"""Tests for remote / on-site job preference helpers."""

from hireloop_api.services.job_preferences import (
    REMOTE_PREFERENCE_ANY,
    REMOTE_PREFERENCE_ONSITE_ONLY,
    REMOTE_PREFERENCE_REMOTE_ONLY,
    normalize_remote_preference,
    remote_filter_sql,
    resolve_remote_preference,
)


def test_normalize_defaults_to_any() -> None:
    assert normalize_remote_preference(None) == REMOTE_PREFERENCE_ANY
    assert normalize_remote_preference("invalid") == REMOTE_PREFERENCE_ANY


def test_normalize_maps_legacy_aliases() -> None:
    assert normalize_remote_preference("remote") == REMOTE_PREFERENCE_REMOTE_ONLY
    assert normalize_remote_preference("WFH") == REMOTE_PREFERENCE_REMOTE_ONLY
    assert normalize_remote_preference("fully remote") == REMOTE_PREFERENCE_REMOTE_ONLY
    assert normalize_remote_preference("onsite") == REMOTE_PREFERENCE_ONSITE_ONLY
    assert normalize_remote_preference("on-site") == REMOTE_PREFERENCE_ONSITE_ONLY
    assert normalize_remote_preference("hybrid") == REMOTE_PREFERENCE_ANY


def test_resolve_prefers_override() -> None:
    assert (
        resolve_remote_preference(stored="any", override="onsite_only")
        == REMOTE_PREFERENCE_ONSITE_ONLY
    )
    assert (
        resolve_remote_preference(stored="remote_only", override=None)
        == REMOTE_PREFERENCE_REMOTE_ONLY
    )


def test_remote_filter_sql() -> None:
    assert remote_filter_sql(REMOTE_PREFERENCE_ANY) == ""
    remote_sql = remote_filter_sql(REMOTE_PREFERENCE_REMOTE_ONLY)
    assert "is_remote = TRUE" in remote_sql
    assert "hybrid" in remote_sql
    assert "is_remote = FALSE" in remote_filter_sql(REMOTE_PREFERENCE_ONSITE_ONLY)


def test_job_is_fully_remote_excludes_hybrid() -> None:
    from hireloop_api.services.job_preferences import job_is_fully_remote

    assert job_is_fully_remote({"is_remote": True}) is True
    assert job_is_fully_remote({"is_remote": True, "employment_type": "hybrid"}) is False
    assert job_is_fully_remote({"is_remote": False, "employment_type": "remote"}) is True
    assert job_is_fully_remote({"is_remote": False, "location_city": "Bengaluru"}) is False
