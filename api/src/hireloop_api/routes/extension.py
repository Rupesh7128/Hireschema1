"""Chrome extension — save external job pages into the candidate tracker."""

from __future__ import annotations

from typing import Any

import asyncpg
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator

from hireloop_api.config import Settings, get_settings
from hireloop_api.deps import get_db, get_phone_verified_user
from hireloop_api.services.extension_jobs import save_external_job_for_candidate

router = APIRouter(prefix="/extension", tags=["extension"])


class ExtensionSaveJobRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=300)
    url: str = Field(..., min_length=8, max_length=2000)
    company: str | None = Field(default=None, max_length=200)
    location: str | None = Field(default=None, max_length=300)
    source_host: str | None = Field(default=None, max_length=120)
    description_snippet: str | None = Field(default=None, max_length=4000)

    @field_validator(
        "title",
        "url",
        "company",
        "location",
        "source_host",
        "description_snippet",
        mode="before",
    )
    @classmethod
    def strip_optional(cls, v: object) -> object:
        if isinstance(v, str):
            cleaned = v.strip()
            return cleaned if cleaned else None
        return v


@router.post("/jobs/save", status_code=201)
async def save_job_from_extension(
    body: ExtensionSaveJobRequest,
    current_user: dict = Depends(get_phone_verified_user),
    db: asyncpg.Connection = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    """Create/match a jobs row from a page URL and bookmark it for the candidate."""
    if not body.title or not body.url:
        from fastapi import HTTPException

        raise HTTPException(status_code=422, detail="title and url are required")

    return await save_external_job_for_candidate(
        db,
        user_id=str(current_user["id"]),
        title=body.title,
        url=body.url,
        company=body.company,
        location=body.location,
        source_host=body.source_host,
        description_snippet=body.description_snippet,
        app_base_url=settings.public_app_url,
    )
