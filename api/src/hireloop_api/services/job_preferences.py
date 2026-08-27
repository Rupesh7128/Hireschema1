"""Candidate remote / on-site job search preferences."""

from __future__ import annotations

import json

REMOTE_PREFERENCE_ANY = "any"
REMOTE_PREFERENCE_REMOTE_ONLY = "remote_only"
REMOTE_PREFERENCE_ONSITE_ONLY = "onsite_only"

VALID_REMOTE_PREFERENCES = frozenset(
    {
        REMOTE_PREFERENCE_ANY,
        REMOTE_PREFERENCE_REMOTE_ONLY,
        REMOTE_PREFERENCE_ONSITE_ONLY,
    }
)

# Chat / memory / older UI often store "remote" or "onsite" instead of *_only.
# Those must not silently collapse to "any" or the feed shows office jobs.
_REMOTE_PREF_ALIASES: dict[str, str] = {
    "any": REMOTE_PREFERENCE_ANY,
    "both": REMOTE_PREFERENCE_ANY,
    "all": REMOTE_PREFERENCE_ANY,
    "hybrid": REMOTE_PREFERENCE_ANY,
    "remote_and_onsite": REMOTE_PREFERENCE_ANY,
    "remote_only": REMOTE_PREFERENCE_REMOTE_ONLY,
    "remote-only": REMOTE_PREFERENCE_REMOTE_ONLY,
    "remote": REMOTE_PREFERENCE_REMOTE_ONLY,
    "wfh": REMOTE_PREFERENCE_REMOTE_ONLY,
    "wfh_only": REMOTE_PREFERENCE_REMOTE_ONLY,
    "work from home": REMOTE_PREFERENCE_REMOTE_ONLY,
    "work_from_home": REMOTE_PREFERENCE_REMOTE_ONLY,
    "fully remote": REMOTE_PREFERENCE_REMOTE_ONLY,
    "fully_remote": REMOTE_PREFERENCE_REMOTE_ONLY,
    "onsite_only": REMOTE_PREFERENCE_ONSITE_ONLY,
    "onsite-only": REMOTE_PREFERENCE_ONSITE_ONLY,
    "onsite": REMOTE_PREFERENCE_ONSITE_ONLY,
    "on-site": REMOTE_PREFERENCE_ONSITE_ONLY,
    "on_site": REMOTE_PREFERENCE_ONSITE_ONLY,
    "office": REMOTE_PREFERENCE_ONSITE_ONLY,
    "in-office": REMOTE_PREFERENCE_ONSITE_ONLY,
    "in_office": REMOTE_PREFERENCE_ONSITE_ONLY,
    "in office": REMOTE_PREFERENCE_ONSITE_ONLY,
}

_NON_REMOTE_EMPLOYMENT = frozenset(
    {"hybrid", "onsite", "on-site", "on_site", "office", "in-office", "in_office"}
)
_REMOTE_EMPLOYMENT = frozenset({"remote", "wfh", "work from home", "work_from_home"})


def normalize_remote_preference(value: str | None) -> str:
    if value is None:
        return REMOTE_PREFERENCE_ANY
    key = str(value).strip().lower().replace("  ", " ")
    if key in VALID_REMOTE_PREFERENCES:
        return key
    return _REMOTE_PREF_ALIASES.get(key, REMOTE_PREFERENCE_ANY)


def job_is_fully_remote(job: dict) -> bool:
    """True only for fully remote / WFH roles — hybrid and office do not count."""
    emp = str(job.get("employment_type") or "").strip().lower()
    if emp in _NON_REMOTE_EMPLOYMENT or emp.startswith("hybrid") or emp.startswith("onsite"):
        return False
    if emp in _REMOTE_EMPLOYMENT or emp.startswith("remote"):
        return True
    return bool(job.get("is_remote"))


def resolve_remote_preference(
    *,
    stored: str | None,
    override: str | None = None,
) -> str:
    """Persisted preference unless the caller passes a one-off override."""
    if override in VALID_REMOTE_PREFERENCES:
        return override
    return normalize_remote_preference(stored)


def remote_filter_sql(preference: str) -> str:
    """
    SQL fragment appended to job queries (preference must be normalized first).
    Remote-only excludes hybrid/office even when is_remote was tagged true.
    """
    pref = normalize_remote_preference(preference)
    if pref == REMOTE_PREFERENCE_REMOTE_ONLY:
        return (
            " AND COALESCE(LOWER(j.employment_type), '') "
            "NOT IN ('hybrid', 'onsite', 'on-site', 'on_site', 'office') "
            " AND (j.is_remote = TRUE OR LOWER(COALESCE(j.employment_type, '')) "
            "IN ('remote', 'wfh'))"
        )
    if pref == REMOTE_PREFERENCE_ONSITE_ONLY:
        return (
            " AND j.is_remote = FALSE"
            " AND COALESCE(LOWER(j.employment_type), '') "
            "NOT IN ('remote', 'wfh')"
        )
    return ""


def preference_label(preference: str) -> str:
    pref = normalize_remote_preference(preference)
    if pref == REMOTE_PREFERENCE_REMOTE_ONLY:
        return "remote only"
    if pref == REMOTE_PREFERENCE_ONSITE_ONLY:
        return "on-site only (no remote)"
    return "remote and on-site"


# ── Negative preferences (#37) — "not interested in X" ─────────────────────────
# Stored on candidates.aarya_state.negative_preferences as lowercased lists:
#   {"companies": [...], "titles": [...]}
# A job is hard-filtered from the feed when its company matches an excluded
# company, or its title contains an excluded title/keyword.

NEGATIVE_PREFS_KEY = "negative_preferences"
_NEG_KINDS = ("companies", "titles")


def _coerce_state(state: object) -> dict:
    if isinstance(state, dict):
        return state
    if isinstance(state, str) and state.strip():
        try:
            obj = json.loads(state)
            return obj if isinstance(obj, dict) else {}
        except json.JSONDecodeError:
            return {}
    return {}


def extract_negative_preferences(state: object) -> tuple[frozenset[str], frozenset[str]]:
    """Return (excluded_companies, excluded_titles) as lowercased frozensets."""
    neg = _coerce_state(state).get(NEGATIVE_PREFS_KEY)
    if not isinstance(neg, dict):
        return frozenset(), frozenset()
    companies = {str(c).strip().lower() for c in (neg.get("companies") or []) if str(c).strip()}
    titles = {str(t).strip().lower() for t in (neg.get("titles") or []) if str(t).strip()}
    return frozenset(companies), frozenset(titles)


def apply_negative_preference(
    state: object, *, kind: str, value: str, remove: bool = False
) -> dict:
    """Add/remove a value to a negative-preference list, returning the new state."""
    if kind not in _NEG_KINDS:
        raise ValueError(f"kind must be one of {_NEG_KINDS}")
    new_state = dict(_coerce_state(state))
    neg = dict(new_state.get(NEGATIVE_PREFS_KEY) or {})
    current = [str(v).strip() for v in (neg.get(kind) or []) if str(v).strip()]
    v = value.strip()
    if remove:
        current = [c for c in current if c.lower() != v.lower()]
    elif v and v.lower() not in {c.lower() for c in current}:
        current.append(v)
    neg[kind] = current[:50]  # bound the list
    new_state[NEGATIVE_PREFS_KEY] = neg
    return new_state
