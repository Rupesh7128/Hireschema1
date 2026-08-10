# Design: Chrome extension — Save job to tracker

**Date:** 2026-08-04  
**Status:** Approved (Reddit / growth removed)  
**Product context:** Candidate-only Hireschema; brand as Hireschema AI.

---

## 1. Problem

Candidates find jobs on LinkedIn and career sites. Leaving the page to bookmark them in Hireschema breaks flow. They need one click from the page → item in the in-app job tracker.

## 2. Goals

1. MV3 Chrome extension: **Save job** on LinkedIn job pages and common career/ATS pages.
2. Persist into the existing candidate tracker (`saved_jobs` → `/me/job-pipeline`).
3. Auth via the user’s existing Hireschema / Supabase session (no separate password store).

## 3. Non-goals

- Reddit, LinkedIn posting, Growth / marketing automation, blog CMS.
- Auto-apply or scraping at backend scale.
- Recruiter features.
- Global-markets migration (separate slice).

## 4. Architecture

```text
Chrome MV3 extension
  → parses page (title, company, location, url, snippet)
  → POST /api/v1/extension/jobs/save  (Bearer Supabase JWT)
FastAPI
  → upsert jobs row by canonical apply_url (source=manual)
  → INSERT saved_jobs ON CONFLICT DO NOTHING
  → return job_id + tracker deep link
```

External URLs often are **not** already in `jobs`. The save endpoint **creates or matches** a `jobs` row, then bookmarks it. Visibility uses the candidate’s market (today: IN locks still apply).

## 5. Auth

1. Popup **Sign in** opens `{APP_URL}/extension/connect`.
2. App page (logged-in) + content script hand the session access token to the extension (`chrome.runtime`).
3. Token stored in `chrome.storage.local`; API calls use `Authorization: Bearer`.
4. Logged-out / 401 → prompt re-connect.

## 6. API

`POST /api/v1/extension/jobs/save` — authenticated (`get_phone_verified_user` same as other candidate routes).

Body:

```json
{
  "title": "string",
  "company": "string | null",
  "location": "string | null",
  "url": "https://...",
  "source_host": "linkedin.com",
  "description_snippet": "string | null"
}
```

Behaviour:

1. Normalize / validate HTTPS URL (max length).
2. Find existing non-deleted job with same `apply_url` (or normalized form).
3. Else insert `jobs` (`source='manual'`, `country_code` from candidate market, company upsert by name when provided).
4. `ensure_saved_job`.
5. Return `{ job_id, saved: true, tracker_url }`.

Rate limit: standard auth user limits; reject empty title / invalid URL with 422.

## 7. Extension surfaces

- Toolbar popup: status, Save current tab, Open tracker, Sign in/out.
- Content script helpers for LinkedIn `/jobs/view/` and generic `document.title` + meta fallback.
- Host permissions: LinkedIn, common ATS hosts, app + API origins.

## 8. Success criteria

- Signed-in candidate saves a LinkedIn (or ATS) job in ≤2 clicks; it appears under Job tracker.
- Unauthenticated user cannot save (401 + Sign in CTA).
- No Reddit / growth code paths ship.
