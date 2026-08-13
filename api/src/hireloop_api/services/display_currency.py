"""Resolve candidate salary display currency from preference + profile signals."""

from __future__ import annotations

from typing import Any

from hireloop_api.markets import resolve_country_from_location

VALID_DISPLAY_CURRENCIES = frozenset({"auto", "INR"})


def infer_market_from_resume_location(location: str | None) -> str | None:
    if not location:
        return None
    return resolve_country_from_location(location)


def resolve_display_currency(
    preference: str | None,
    *,
    market: str = "IN",
    location_city: str | None = None,
    location_state: str | None = None,
) -> str:
    """
    Return ISO currency code for UI salary formatting.

    India-only marketplace: always INR, regardless of stored preference.
    """
    _ = (preference, market, location_city, location_state)
    return "INR"


def currency_fields_for_candidate(row: dict[str, Any] | None) -> dict[str, str]:
    if not row:
        return {"display_currency": "auto", "display_currency_resolved": "INR"}
    pref = str(row.get("display_currency") or "auto")
    resolved = resolve_display_currency(
        pref,
        market=str(row.get("market") or "IN"),
        location_city=row.get("location_city"),
        location_state=row.get("location_state"),
    )
    return {
        "display_currency": pref if pref in VALID_DISPLAY_CURRENCIES else "auto",
        "display_currency_resolved": resolved,
    }
