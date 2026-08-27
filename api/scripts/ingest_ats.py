"""
Ingest jobs from Greenhouse + Lever + Ashby public boards (backend plan #26).

Empty env lists use the bundled career-ops-india catalog. Set a comma-separated
list to override that channel only. Fetches + normalises + India/remote-filters
each posting, then upserts through JobIngester (dedup, company-link, apply_url).

Run:  cd api && uv run python scripts/ingest_ats.py
Cron: daily, before recompute_matches.py.
"""

from __future__ import annotations

import asyncio

import structlog

from hireloop_api.config import get_settings
from hireloop_api.deps import get_db_pool
from hireloop_api.services.apify.job_ingester import JobIngester
from hireloop_api.services.ats.ats_source import ATSSource
from hireloop_api.services.ats.india_ats_catalog import resolve_ats_boards

logger = structlog.get_logger()


async def main() -> None:
    settings = get_settings()
    boards = resolve_ats_boards(settings)
    greenhouse = boards.get("greenhouse") or []
    lever = boards.get("lever") or []
    ashby = boards.get("ashby") or []
    if not greenhouse and not lever and not ashby:
        print(
            "No ATS sources configured. Empty lists use the bundled India catalog "
            "when ATS_USE_BUNDLED_INDIA_CATALOG=true. Set ATS_GREENHOUSE_BOARDS, "
            "ATS_LEVER_COMPANIES, and/or ATS_ASHBY_BOARDS (comma-separated) to "
            "override a channel, or enable the bundled catalog."
        )
        return

    print(
        f"Fetching ATS feeds: {len(greenhouse)} Greenhouse board(s), "
        f"{len(lever)} Lever, {len(ashby)} Ashby…"
    )
    concurrency = max(1, int(settings.ats_fetch_concurrency or 6))
    records, _stats = await ATSSource().fetch_boards(boards, concurrency=concurrency)
    print(f"Normalised + India/remote-eligible: {len(records)} jobs")
    if not records:
        return

    pool = await get_db_pool(settings)
    async with pool.acquire() as conn:
        ingester = JobIngester(apify_token="", db=conn)
        stats = await ingester.ingest_records(records)
    print(f"Done: {stats}")


if __name__ == "__main__":
    asyncio.run(main())
