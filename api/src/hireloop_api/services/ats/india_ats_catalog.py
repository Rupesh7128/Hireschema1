"""Bundled Indian ATS boards from career-ops-india (MIT).

Source: https://github.com/AnojSKunte/career-ops-india/blob/main/portals/india.yml
Greenhouse / Lever / Ashby public JSON — no API key, no Apify.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Literal

from hireloop_api.config import Settings

AtsKind = Literal["greenhouse", "lever", "ashby"]

_CATALOG_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "india_ats_boards.json"


def _slug(value: str) -> str:
    return value.strip().lower().strip("/")


@lru_cache(maxsize=1)
def load_bundled_india_ats_catalog() -> dict[AtsKind, list[dict[str, str]]]:
    raw = json.loads(_CATALOG_PATH.read_text(encoding="utf-8"))
    out: dict[AtsKind, list[dict[str, str]]] = {"greenhouse": [], "lever": [], "ashby": []}
    for kind in out:
        seen: set[str] = set()
        for row in raw.get(kind) or []:
            slug = _slug(str(row.get("slug") or ""))
            name = str(row.get("name") or slug).strip()
            if not slug or slug in seen:
                continue
            seen.add(slug)
            out[kind].append({"slug": slug, "name": name or slug})
    return out


def resolve_ats_boards(settings: Settings | None) -> dict[AtsKind, list[dict[str, str]]]:
    """Env slugs override a channel; empty env uses the bundled India catalog."""
    bundled = load_bundled_india_ats_catalog()
    if settings is None:
        return bundled
    use_bundled = settings.ats_use_bundled_india_catalog
    resolved: dict[AtsKind, list[dict[str, str]]] = {"greenhouse": [], "lever": [], "ashby": []}
    env_map: dict[AtsKind, list[str]] = {
        "greenhouse": settings.ats_greenhouse_boards,
        "lever": settings.ats_lever_companies,
        "ashby": settings.ats_ashby_boards,
    }
    for kind, env_slugs in env_map.items():
        cleaned = [_slug(s) for s in env_slugs if _slug(s)]
        if cleaned:
            names = {row["slug"]: row["name"] for row in bundled[kind]}
            resolved[kind] = [
                {"slug": s, "name": names.get(s, s.replace("-", " ").title())} for s in cleaned
            ]
        elif use_bundled:
            resolved[kind] = list(bundled[kind])
    return resolved
