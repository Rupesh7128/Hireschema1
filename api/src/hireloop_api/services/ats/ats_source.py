"""
ATS feed ingestion — Greenhouse + Lever + Ashby public job boards.

Why: FREE first-party JSON from company career pages with real apply URLs.
Higher trust than scraped listings; no Apify spend. Default board list is the
bundled career-ops-india catalog (MIT).

India-first: keep India-located roles or remotes not restricted to another
country. Remotes are tagged allowed_regions=["IN"].
"""

from __future__ import annotations

import asyncio
import html
import re
from datetime import UTC, datetime, timedelta
from typing import Any

import httpx
import structlog

from hireloop_api.markets import remote_allowed_regions
from hireloop_api.services.apify.jobs_scraper import JobRecord

logger = structlog.get_logger()

_GREENHOUSE_BOARD = "https://boards-api.greenhouse.io/v1/boards/{token}"
_LEVER_POSTINGS = "https://api.lever.co/v0/postings/{company}?mode=json"
_ASHBY_BOARD = "https://api.ashbyhq.com/posting-api/job-board/{slug}"
_USER_AGENT = "HireschemaJobIngest/1.0 (+https://www.hireschema.com)"

# India signals in a free-text location string.
_INDIA_TOKENS = (
    "india",
    "bengaluru",
    "bangalore",
    "mumbai",
    "delhi",
    "new delhi",
    "gurgaon",
    "gurugram",
    "noida",
    "hyderabad",
    "pune",
    "chennai",
    "kolkata",
    "ahmedabad",
    "remote - india",
    "remote, india",
)

# Geo-restricted remote phrasing that excludes an India-based candidate.
_NON_INDIA_REMOTE = (
    "us only",
    "u.s. only",
    "united states only",
    "us-based",
    "usa only",
    "north america only",
    "eu only",
    "emea only",
    "uk only",
    "united kingdom only",
    "canada only",
    "us remote",
    "remote (us",
    "remote - us",
    "remote, us",
    "authorized to work in the united states",
)

_REMOTE_TOKENS = ("remote", "anywhere", "work from home", "wfh", "distributed")
_TAG_RE = re.compile(r"<[^>]+>")


def _clean_html(text: str | None) -> str | None:
    if not text:
        return None
    out = html.unescape(_TAG_RE.sub(" ", text))
    out = re.sub(r"\s+", " ", out).strip()
    return out or None


def assess_location(location: str | None, text: str | None) -> tuple[bool, bool]:
    """
    Decide whether a posting is eligible for an India-based candidate.

    Returns (keep, is_remote). Keep when the role is in India, or remote and not
    restricted to a non-India region. The remote-region check is the borrowed
    eligibility filter — it reads BOTH the location and the description, since
    "US-only" often hides in the body.
    """
    loc = (location or "").lower()
    body = (text or "").lower()
    haystack = f"{loc} {body}"

    is_remote = any(t in loc for t in _REMOTE_TOKENS)

    if any(t in loc for t in _INDIA_TOKENS):
        return True, is_remote
    if is_remote and not any(p in haystack for p in _NON_INDIA_REMOTE):
        # Global-remote with no geo restriction → an India candidate can take it.
        return True, True
    return False, is_remote


def _india_city(location: str | None) -> str | None:
    loc = (location or "").lower()
    for tok in _INDIA_TOKENS:
        if tok in loc and tok not in ("india", "remote - india", "remote, india"):
            return tok.title()
    return None


def parse_greenhouse(payload: dict, *, token: str, company_name: str) -> list[JobRecord]:
    """Normalise a Greenhouse `/jobs?content=true` payload into JobRecords."""
    records: list[JobRecord] = []
    for job in payload.get("jobs", []):
        title = (job.get("title") or "").strip()
        if not title:
            continue
        location = (job.get("location") or {}).get("name")
        description = _clean_html(job.get("content"))
        keep, is_remote = assess_location(location, description)
        if not keep:
            continue
        records.append(
            JobRecord(
                apify_job_id=f"greenhouse:{token}:{job.get('id')}",
                title=title,
                description=description,
                company_name=company_name,
                location_city=_india_city(location),
                is_remote=is_remote,
                allowed_regions=remote_allowed_regions() if is_remote else None,
                apply_url=job.get("absolute_url"),
                source="greenhouse",
                expires_at=datetime.now(UTC) + timedelta(days=30),
                raw_data={"location": location, "updated_at": job.get("updated_at")},
            )
        )
    return records


def parse_lever(payload: list, *, company: str) -> list[JobRecord]:
    """Normalise a Lever `/postings?mode=json` payload into JobRecords."""
    records: list[JobRecord] = []
    company_name = company.replace("-", " ").title()
    for job in payload:
        title = (job.get("text") or "").strip()
        if not title:
            continue
        cats = job.get("categories") or {}
        location = cats.get("location")
        workplace = (job.get("workplaceType") or "").lower()
        description = _clean_html(job.get("descriptionPlain") or job.get("description"))
        keep, is_remote = assess_location(location, description)
        if workplace == "remote":
            is_remote = True
        if not keep:
            continue
        records.append(
            JobRecord(
                apify_job_id=f"lever:{company}:{job.get('id')}",
                title=title,
                description=description,
                company_name=company_name,
                location_city=_india_city(location),
                is_remote=is_remote,
                allowed_regions=remote_allowed_regions() if is_remote else None,
                apply_url=job.get("hostedUrl") or job.get("applyUrl"),
                source="lever",
                expires_at=datetime.now(UTC) + timedelta(days=30),
                raw_data={"location": location, "team": cats.get("team")},
            )
        )
    return records


def _ashby_location_text(job: dict[str, Any]) -> str:
    loc = job.get("location")
    if isinstance(loc, dict):
        loc = loc.get("name") or loc.get("locationName") or ""
    parts = [str(loc or "").strip()]
    for sec in job.get("secondaryLocations") or []:
        if isinstance(sec, str):
            parts.append(sec.strip())
        elif isinstance(sec, dict):
            parts.append(str(sec.get("location") or sec.get("name") or "").strip())
    return ", ".join(p for p in parts if p)


def parse_ashby(payload: dict, *, slug: str, company_name: str) -> list[JobRecord]:
    """Normalise Ashby `/posting-api/job-board/{slug}` JSON into JobRecords."""
    records: list[JobRecord] = []
    jobs = payload.get("jobs") or payload.get("jobPostings") or []
    if not isinstance(jobs, list):
        return records
    for job in jobs:
        if not isinstance(job, dict):
            continue
        if job.get("isListed") is False:
            continue
        title = (job.get("title") or "").strip()
        if not title:
            continue
        location = _ashby_location_text(job)
        description = _clean_html(job.get("descriptionHtml") or job.get("descriptionPlain"))
        keep, is_remote = assess_location(location, description)
        if job.get("isRemote") is True or str(job.get("workplaceType") or "").lower() == "remote":
            is_remote = True
            if not keep and not any(
                p in f"{location} {description or ''}".lower() for p in _NON_INDIA_REMOTE
            ):
                keep = True
        if not keep:
            continue
        apply_url = job.get("jobUrl") or job.get("applyUrl")
        records.append(
            JobRecord(
                apify_job_id=f"ashby:{slug}:{job.get('id')}",
                title=title,
                description=description,
                company_name=company_name,
                location_city=_india_city(location),
                is_remote=is_remote,
                allowed_regions=remote_allowed_regions() if is_remote else None,
                apply_url=apply_url,
                source="ashby",
                expires_at=datetime.now(UTC) + timedelta(days=30),
                raw_data={"location": location, "published_at": job.get("publishedAt")},
            )
        )
    return records


class ATSSource:
    """Fetches Greenhouse + Lever + Ashby public boards and returns JobRecords."""

    def __init__(self, *, timeout: float = 20.0) -> None:
        self._timeout = timeout

    async def fetch_all(
        self,
        greenhouse_tokens: list[str],
        lever_companies: list[str],
        ashby_slugs: list[str] | None = None,
        *,
        concurrency: int = 6,
    ) -> list[JobRecord]:
        boards = {
            "greenhouse": [{"slug": t, "name": t} for t in greenhouse_tokens],
            "lever": [{"slug": c, "name": c} for c in lever_companies],
            "ashby": [{"slug": s, "name": s} for s in (ashby_slugs or [])],
        }
        records, _stats = await self.fetch_boards(boards, concurrency=concurrency)
        return records

    async def fetch_boards(
        self,
        boards: dict[str, list[dict[str, str]]],
        *,
        concurrency: int = 6,
    ) -> tuple[list[JobRecord], dict[str, Any]]:
        sem = asyncio.Semaphore(max(1, concurrency))
        headers = {"User-Agent": _USER_AGENT, "Accept": "application/json"}
        tasks: list[tuple[str, str, Any]] = []

        async with httpx.AsyncClient(timeout=self._timeout, headers=headers) as client:

            async def run(
                kind: str, slug: str, name: str
            ) -> tuple[str, str, list[JobRecord], str | None]:
                async with sem:
                    try:
                        if kind == "greenhouse":
                            recs = await self._fetch_greenhouse(client, slug, name)
                        elif kind == "lever":
                            recs = await self._fetch_lever(client, slug, name)
                        else:
                            recs = await self._fetch_ashby(client, slug, name)
                        return kind, slug, recs, None
                    except Exception as exc:
                        return kind, slug, [], str(exc)[:200]

            coros = []
            for kind in ("greenhouse", "lever", "ashby"):
                for row in boards.get(kind) or []:
                    slug = (row.get("slug") or "").strip()
                    if not slug:
                        continue
                    name = (row.get("name") or slug).strip()
                    coros.append(run(kind, slug, name))
                    tasks.append((kind, slug, name))

            results = await asyncio.gather(*coros) if coros else []

        records: list[JobRecord] = []
        failed = 0
        fetched = 0
        for _kind, _slug, recs, err in results:
            if err is not None or recs is None:
                failed += 1
                continue
            fetched += 1
            records.extend(recs)

        stats: dict[str, Any] = {
            "raw_items": len(records),
            "normalised": len(records),
            "boards": len(tasks),
            "boards_ok": fetched,
            "boards_failed": failed,
            "greenhouse": len(boards.get("greenhouse") or []),
            "lever": len(boards.get("lever") or []),
            "ashby": len(boards.get("ashby") or []),
        }
        if tasks and fetched == 0:
            stats["error"] = f"all {len(tasks)} ATS boards failed"
        logger.info("ats_fetch_done", **{k: v for k, v in stats.items() if k != "error"})
        return records, stats

    async def _fetch_greenhouse(
        self, client: httpx.AsyncClient, token: str, company_name: str
    ) -> list[JobRecord]:
        meta = await client.get(_GREENHOUSE_BOARD.format(token=token))
        resolved_name = company_name
        if meta.is_success:
            resolved_name = str(meta.json().get("name") or company_name)
        res = await client.get(
            f"{_GREENHOUSE_BOARD.format(token=token)}/jobs", params={"content": "true"}
        )
        if not res.is_success:
            logger.warning("greenhouse_fetch_failed", token=token, status=res.status_code)
            raise RuntimeError(f"greenhouse HTTP {res.status_code}")
        return parse_greenhouse(res.json(), token=token, company_name=resolved_name)

    async def _fetch_lever(
        self, client: httpx.AsyncClient, company: str, company_name: str
    ) -> list[JobRecord]:
        res = await client.get(_LEVER_POSTINGS.format(company=company))
        if not res.is_success:
            logger.warning("lever_fetch_failed", company=company, status=res.status_code)
            raise RuntimeError(f"lever HTTP {res.status_code}")
        recs = parse_lever(res.json(), company=company)
        if company_name and company_name != company:
            for rec in recs:
                rec.company_name = company_name
        return recs

    async def _fetch_ashby(
        self, client: httpx.AsyncClient, slug: str, company_name: str
    ) -> list[JobRecord]:
        res = await client.get(
            _ASHBY_BOARD.format(slug=slug), params={"includeCompensation": "true"}
        )
        if not res.is_success:
            logger.warning("ashby_fetch_failed", slug=slug, status=res.status_code)
            raise RuntimeError(f"ashby HTTP {res.status_code}")
        return parse_ashby(res.json(), slug=slug, company_name=company_name)
