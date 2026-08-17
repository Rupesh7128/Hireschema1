from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import logging

from hireloop_api.deps import get_supabase_client, SupabaseClient

router = APIRouter(prefix="/live-feed", tags=["live-feed"])
logger = logging.getLogger(__name__)

class JobPayload(BaseModel):
    title: str
    company: str
    location: str
    work_type: Optional[str] = None
    salary: Optional[str] = None
    url: HttpUrl
    tags: Optional[List[str]] = []

class SyncRequest(BaseModel):
    secret: str
    jobs: List[JobPayload]

# Using a hardcoded secret for the MVP / internal bot sync
# In production, this should come from settings/environment
SYNC_SECRET = "internal_bot_sync_secret_2026"

@router.post("/sync")
async def sync_live_jobs(
    payload: SyncRequest,
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    if payload.secret != SYNC_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid sync secret"
        )
    
    if not payload.jobs:
        return {"status": "ok", "inserted": 0}
        
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=7)
    
    # Format jobs for insertion
    records = []
    for job in payload.jobs:
        records.append({
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "work_type": job.work_type,
            "salary": job.salary,
            "url": str(job.url),
            "tags": job.tags or [],
            "created_at": now.isoformat(),
            "expires_at": expires_at.isoformat()
        })
        
    try:
        # Use service role client if available to bypass RLS for inserts
        # Assuming get_supabase_client returns an admin/service client for endpoints
        # depending on auth context. For internal routes, we often use service role.
        response = supabase.table("live_feed_jobs").insert(records).execute()
        return {"status": "ok", "inserted": len(response.data)}
    except Exception as e:
        logger.error(f"Failed to sync live jobs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
