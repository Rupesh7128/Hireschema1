"""Live-feed sync must import against asyncpg deps (not a missing Supabase client)."""

from __future__ import annotations

from hireloop_api.routes import live_feed


def test_live_feed_module_uses_service_secret_not_hardcoded() -> None:
    assert not hasattr(live_feed, "SYNC_SECRET")
    assert hasattr(live_feed, "sync_live_jobs")


def test_api_app_imports_with_live_feed_router() -> None:
    from hireloop_api.main import app

    paths = {getattr(route, "path", "") for route in app.routes}
    assert "/api/v1/live-feed/sync" in paths
