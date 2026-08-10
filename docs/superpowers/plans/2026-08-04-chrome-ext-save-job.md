# Chrome extension — Save job Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Ship an MV3 Chrome extension that saves the current job page into the candidate’s Hireschema tracker via a new authenticated API.

**Architecture:** Extension parses the active tab → `POST /api/v1/extension/jobs/save` with Supabase Bearer JWT → API upserts a `jobs` row by `apply_url` (`source=manual`) and bookmarks `saved_jobs`. Auth handoff via `/extension/connect` on the SPA.

**Tech Stack:** Chrome MV3 (vanilla JS), FastAPI, asyncpg, existing `saved_jobs` / `jobs` / `companies` tables, Next.js connect page.

---

### Task 1: API — save external job

**Files:**
- Create: `api/src/hireloop_api/routes/extension.py`
- Create: `api/src/hireloop_api/services/extension_jobs.py`
- Create: `api/tests/test_extension_save_job.py`
- Modify: `api/src/hireloop_api/main.py` (include router)

- [x] Write failing tests for upsert-by-url + save + validation
- [x] Implement service + route
- [x] Run `pytest api/tests/test_extension_save_job.py -v`

### Task 2: App — extension connect page

**Files:**
- Create: `app/src/app/extension/connect/page.tsx`

- [x] Page reads Supabase session and posts token to extension (or shows “install / allow” instructions)
- [x] Deep link to tracker configured via `NEXT_PUBLIC_*` / `public_app_url`

### Task 3: Extension scaffold

**Files:**
- Create: `extension/manifest.json`
- Create: `extension/background.js`
- Create: `extension/popup.html`, `extension/popup.js`, `extension/popup.css`
- Create: `extension/content/job-page.js`
- Create: `extension/content/app-connect.js`
- Create: `extension/README.md`
- Create: `extension/icons/` (simple placeholders)

- [x] Save current tab via API
- [x] Sign-in flow opens connect page
- [x] Document load-unpacked + env (`API_BASE`, `APP_ORIGIN`)

### Task 4: Verify

- [x] `pytest` for extension route
- [x] `pnpm --filter app typecheck` for connect page
