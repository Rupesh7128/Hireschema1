"""#26: ATS (Greenhouse + Lever + Ashby) parsing + India/remote-eligibility filter."""

from __future__ import annotations

from hireloop_api.services.ats.ats_source import (
    assess_location,
    parse_ashby,
    parse_greenhouse,
    parse_lever,
)


def test_assess_location_india_onsite_dropped() -> None:
    keep, remote = assess_location("Bengaluru, India", None)
    assert keep is False and remote is False


def test_assess_location_india_remote_kept() -> None:
    keep, remote = assess_location("Remote, Bengaluru, India", None)
    assert keep is True and remote is True


def test_assess_location_global_remote_kept() -> None:
    keep, remote = assess_location("Remote", "Work from anywhere in the world.")
    assert keep is True and remote is True


def test_assess_location_us_only_remote_dropped() -> None:
    keep, _ = assess_location("Remote (US only)", None)
    assert keep is False
    # Restriction hidden in the body must also be caught.
    keep2, _ = assess_location("Remote", "You must be authorized to work in the United States.")
    assert keep2 is False


def test_assess_location_other_country_onsite_dropped() -> None:
    keep, _ = assess_location("San Francisco, CA", None)
    assert keep is False


def test_parse_greenhouse_filters_and_normalises() -> None:
    payload = {
        "jobs": [
            {
                "id": 1,
                "title": "Senior Backend Engineer",
                "location": {"name": "Remote, Bengaluru, India"},
                "content": "&lt;p&gt;Build &amp; scale APIs&lt;/p&gt;",
                "absolute_url": "https://boards.greenhouse.io/acme/jobs/1",
            },
            {
                "id": 2,
                "title": "US Sales Rep",
                "location": {"name": "Remote (US only)"},
                "content": "x",
                "absolute_url": "https://boards.greenhouse.io/acme/jobs/2",
            },
        ]
    }
    recs = parse_greenhouse(payload, token="acme", company_name="Acme")
    assert len(recs) == 1
    r = recs[0]
    assert r.title == "Senior Backend Engineer"
    assert r.apify_job_id == "greenhouse:acme:1"
    assert r.source == "greenhouse"
    assert r.company_name == "Acme"
    assert r.apply_url == "https://boards.greenhouse.io/acme/jobs/1"
    assert r.is_remote is True
    assert r.allowed_regions == ["IN"]
    assert "Build & scale APIs" in (r.description or "")  # html unescaped + stripped


def test_parse_lever_remote_workplace() -> None:
    payload = [
        {
            "id": "abc",
            "text": "Product Manager",
            "categories": {"location": "Remote", "commitment": "Full-time", "team": "Product"},
            "descriptionPlain": "Own the roadmap. Global team, no location requirement.",
            "hostedUrl": "https://jobs.lever.co/startup/abc",
            "workplaceType": "remote",
        }
    ]
    recs = parse_lever(payload, company="startup")
    assert len(recs) == 1
    assert recs[0].is_remote is True
    assert recs[0].allowed_regions == ["IN", "WORLD"]
    assert recs[0].apify_job_id == "lever:startup:abc"
    assert recs[0].source == "lever"
    assert recs[0].company_name == "Startup"


def test_parse_ashby_keeps_bengaluru_remote_job() -> None:
    payload = {
        "jobs": [
            {
                "id": "ash-1",
                "title": "Backend Engineer",
                "location": "Remote, Bengaluru, India",
                "isListed": True,
                "isRemote": True,
                "descriptionHtml": "<p>Build APIs</p>",
                "jobUrl": "https://jobs.ashbyhq.com/acme/ash-1",
            }
        ]
    }
    recs = parse_ashby(payload, slug="acme", company_name="Acme")
    assert len(recs) == 1
    r = recs[0]
    assert r.title == "Backend Engineer"
    assert r.apify_job_id == "ashby:acme:ash-1"
    assert r.source == "ashby"
    assert r.company_name == "Acme"
    assert r.apply_url == "https://jobs.ashbyhq.com/acme/ash-1"
    assert r.is_remote is True
    assert r.allowed_regions == ["IN"]


def test_parse_ashby_drops_us_only_remote() -> None:
    payload = {
        "jobs": [
            {
                "id": "ash-us",
                "title": "US Sales Rep",
                "location": "Remote (US only)",
                "isListed": True,
                "isRemote": True,
                "descriptionPlain": "Must be authorized to work in the United States.",
                "jobUrl": "https://jobs.ashbyhq.com/acme/ash-us",
            }
        ]
    }
    recs = parse_ashby(payload, slug="acme", company_name="Acme")
    assert recs == []


def test_parse_ashby_skips_unlisted() -> None:
    payload = {
        "jobs": [
            {
                "id": "ash-hidden",
                "title": "Staff Engineer",
                "location": "Bengaluru, India",
                "isListed": False,
                "jobUrl": "https://jobs.ashbyhq.com/acme/ash-hidden",
            }
        ]
    }
    recs = parse_ashby(payload, slug="acme", company_name="Acme")
    assert recs == []


def test_parse_ashby_keeps_is_remote_with_india_regions() -> None:
    payload = {
        "jobs": [
            {
                "id": "ash-remote",
                "title": "Product Designer",
                "location": "Anywhere",
                "isListed": True,
                "isRemote": True,
                "descriptionPlain": "Global team, no location requirement.",
                "jobUrl": "https://jobs.ashbyhq.com/acme/ash-remote",
            }
        ]
    }
    recs = parse_ashby(payload, slug="acme", company_name="Acme")
    assert len(recs) == 1
    assert recs[0].is_remote is True
    assert recs[0].allowed_regions == ["IN", "WORLD"]
    assert recs[0].source == "ashby"
