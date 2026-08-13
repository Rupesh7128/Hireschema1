"""
India-only edge gate for API spend paths.

Marketing / SEO pages stay global. Authenticated and LLM-spending API routes
reject non-IN clients when a CDN country header is present. Missing headers
fail open so local dev and misconfigured proxies keep working.

Exempt: health, markets catalog, invite waitlist, service-secret ingest/webhooks.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse

from hireloop_api.config import Settings, get_settings

_UNKNOWN_COUNTRIES = frozenset({"XX", "T1", "XL", "A1", "A2", "O1"})

_EXEMPT_PREFIXES = (
    "/api/v1/health",
    "/api/v1/jobs/ingest",
    "/api/v1/matches/embed",
    "/api/v1/matches/recompute",
    "/api/v1/gmail",
    "/api/v1/webhooks",
)

_EXEMPT_EXACT = frozenset(
    {
        "/api/v1/markets",
        "/api/v1/public/invite-request",
    }
)

INDIA_ONLY_DETAIL = {
    "error_code": "india_only",
    "message": "Hireschema is available in India only. Join the waitlist.",
    "invite_path": "/invite?reason=india",
}


def client_country(request: Request) -> str | None:
    """Best-effort ISO country from Cloudflare / Vercel geo headers."""
    for header in ("cf-ipcountry", "x-vercel-ip-country", "x-country-code"):
        raw = (request.headers.get(header) or "").strip().upper()
        if len(raw) == 2 and raw not in _UNKNOWN_COUNTRIES:
            return raw
    return None


def is_india_geo_exempt(path: str) -> bool:
    if path in _EXEMPT_EXACT:
        return True
    return any(path.startswith(prefix) for prefix in _EXEMPT_PREFIXES)


def should_enforce_india_geo(settings: Settings) -> bool:
    flag = settings.require_india_geo
    if flag is False:
        return False
    if flag is True:
        return True
    return settings.environment in {"production", "staging"}


async def india_geo_middleware(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    if request.method == "OPTIONS":
        return await call_next(request)

    path = request.url.path
    if is_india_geo_exempt(path):
        return await call_next(request)

    settings = get_settings()
    if not should_enforce_india_geo(settings):
        return await call_next(request)

    country = client_country(request)
    if country is None or country == "IN":
        return await call_next(request)

    return JSONResponse(
        status_code=403,
        content={"detail": INDIA_ONLY_DETAIL},
    )
