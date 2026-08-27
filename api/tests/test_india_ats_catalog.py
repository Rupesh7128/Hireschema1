"""Bundled career-ops-india ATS catalog + env channel overrides."""

from __future__ import annotations

from types import SimpleNamespace

from hireloop_api.services.ats.india_ats_catalog import (
    load_bundled_india_ats_catalog,
    resolve_ats_boards,
)


def test_bundled_india_ats_catalog_counts() -> None:
    catalog = load_bundled_india_ats_catalog()
    greenhouse = len(catalog["greenhouse"])
    lever = len(catalog["lever"])
    ashby = len(catalog["ashby"])
    # Exact unique-slug counts from india_ats_boards.json (career-ops-india).
    assert greenhouse == 83
    assert lever == 67
    assert ashby == 105
    assert greenhouse + lever + ashby == 255


def test_env_greenhouse_override_keeps_bundled_lever_ashby() -> None:
    bundled = load_bundled_india_ats_catalog()
    settings = SimpleNamespace(
        ats_greenhouse_boards=["razorpay"],
        ats_lever_companies=[],
        ats_ashby_boards=[],
        ats_use_bundled_india_catalog=True,
    )
    resolved = resolve_ats_boards(settings)  # type: ignore[arg-type]
    assert [row["slug"] for row in resolved["greenhouse"]] == ["razorpay"]
    assert resolved["lever"] == bundled["lever"]
    assert resolved["ashby"] == bundled["ashby"]


def test_env_empty_without_bundled_catalog_is_empty() -> None:
    settings = SimpleNamespace(
        ats_greenhouse_boards=[],
        ats_lever_companies=[],
        ats_ashby_boards=[],
        ats_use_bundled_india_catalog=False,
    )
    resolved = resolve_ats_boards(settings)  # type: ignore[arg-type]
    assert resolved["greenhouse"] == []
    assert resolved["lever"] == []
    assert resolved["ashby"] == []
