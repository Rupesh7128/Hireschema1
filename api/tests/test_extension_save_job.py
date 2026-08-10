from __future__ import annotations

import json
import uuid
from typing import Any

import pytest
from fastapi import HTTPException

from hireloop_api.services.extension_jobs import normalize_job_url, save_external_job_for_candidate


def test_normalize_job_url_strips_tracking() -> None:
    out = normalize_job_url(
        "https://www.LinkedIn.com/jobs/view/123/?utm_source=share&fbclid=abc#frag"
    )
    assert out == "https://www.linkedin.com/jobs/view/123"


def test_normalize_job_url_rejects_non_http() -> None:
    with pytest.raises(HTTPException) as exc:
        normalize_job_url("javascript:alert(1)")
    assert exc.value.status_code == 422


class _FakeDb:
    def __init__(self) -> None:
        self.candidate_id = uuid.uuid4()
        self.inserted_jobs: list[tuple[Any, ...]] = []
        self.saved: list[tuple[uuid.UUID, uuid.UUID]] = []
        self.existing_job_id: uuid.UUID | None = None

    async def fetchrow(self, query: str, *args: object) -> dict[str, object] | None:
        if "FROM public.candidates" in query:
            return {"id": self.candidate_id}
        if "FROM public.companies" in query and "LOWER(name)" in query:
            return None
        if "SELECT id FROM public.jobs" in query and "apply_url" in query:
            if self.existing_job_id:
                return {"id": self.existing_job_id}
            return None
        if "fetch_candidate_market" in query or "market" in query.lower():
            return None
        return None

    async def fetchval(self, query: str, *args: object) -> object | None:
        if "candidates" in query and "market" in query.lower():
            return "IN"
        return "IN"

    async def execute(self, query: str, *args: object) -> str:
        if "INSERT INTO public.jobs" in query:
            self.inserted_jobs.append(args)
            return "INSERT 0 1"
        if "INSERT INTO public.saved_jobs" in query:
            self.saved.append((args[0], args[1]))  # type: ignore[arg-type]
            return "INSERT 0 1"
        if "INSERT INTO public.companies" in query:
            return "INSERT 0 1"
        return "OK"


@pytest.mark.asyncio
async def test_save_external_job_creates_and_bookmarks(monkeypatch: pytest.MonkeyPatch) -> None:
    db = _FakeDb()

    async def _market(_db: object, _cid: object) -> str:
        return "IN"

    monkeypatch.setattr(
        "hireloop_api.services.extension_jobs.fetch_candidate_market",
        _market,
    )

    result = await save_external_job_for_candidate(
        db,  # type: ignore[arg-type]
        user_id=str(uuid.uuid4()),
        title="Senior Backend Engineer",
        url="https://www.linkedin.com/jobs/view/999/?utm_source=x",
        company="Acme",
        location="Bengaluru, Karnataka",
        source_host="www.linkedin.com",
        description_snippet="Build APIs.",
        app_base_url="https://app.hireschema.com",
    )

    assert result["saved"] is True
    assert result["created"] is True
    assert result["apply_url"] == "https://www.linkedin.com/jobs/view/999"
    assert "panel=jobs" in result["tracker_url"]
    assert len(db.inserted_jobs) == 1
    assert len(db.saved) == 1
    # raw_data JSON — last insert arg should be serialisable
    raw = db.inserted_jobs[0][-1]
    assert isinstance(raw, dict)
    assert raw["origin"] == "chrome_extension"
    json.dumps(raw)  # must be JSON-friendly


@pytest.mark.asyncio
async def test_save_external_job_reuses_existing(monkeypatch: pytest.MonkeyPatch) -> None:
    db = _FakeDb()
    db.existing_job_id = uuid.uuid4()

    async def _market(_db: object, _cid: object) -> str:
        return "IN"

    monkeypatch.setattr(
        "hireloop_api.services.extension_jobs.fetch_candidate_market",
        _market,
    )

    result = await save_external_job_for_candidate(
        db,  # type: ignore[arg-type]
        user_id=str(uuid.uuid4()),
        title="Role",
        url="https://boards.greenhouse.io/acme/jobs/1",
        app_base_url="http://localhost:3001",
    )

    assert result["created"] is False
    assert result["job_id"] == str(db.existing_job_id)
    assert db.inserted_jobs == []
    assert len(db.saved) == 1
