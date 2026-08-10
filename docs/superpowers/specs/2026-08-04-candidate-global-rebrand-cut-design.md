# Design: Candidate-only cut + Hireschema AI rebrand (Slice 1)

**Date:** 2026-08-04  
**Status:** Approved for planning (user locked: candidate-only, delete recruiter, brand = Hireschema AI)  
**Out of scope for Slice 1:** Global market unlock, Chrome extension (later slices)

---

## Product intent

Hireschema becomes a **candidate-only** career OS:

- One AI surface branded **Hireschema AI** (not Aarya / Nitya).
- Text + voice chat (Deepgram) stays on the candidate path.
- Application / job **tracker** remains a first-class surface.
- Recruiter product is **removed** from the SPA and API surface (aggressive cut).

Later slices (not this design):

1. **Global markets** — lift India-only `ENABLED_MARKETS=IN` locks (explicit product change vs historical R4).
2. **Chrome extension** — one-click save LinkedIn / career-site jobs into the tracker.

---

## Goals (Slice 1)

1. No user-facing “Aarya”, “Nitya”, or recruiter signup/workspace in the candidate product.
2. Candidate can still: sign up → onboard → chat/voice with Hireschema AI → matches → tracker / kits / resumes.
3. Recruiter routes return gone (404) or are deleted; auth bootstrap never lands on `/recruiter`.
4. Minimal breakage to CI and existing candidate tests after string/route updates.

## Non-goals (Slice 1)

- Renaming Python packages `hireloop_api.agents.aarya` / `nitya` (internal codepaths may keep module names).
- Enabling non-IN markets or currency/phone localization.
- Building the Chrome extension.
- Google OAuth / HM cold-email verification work.
- Marketing `web/` full copy rewrite (only critical shared/legal strings if they name Aarya/Nitya).

---

## Branding rules

| Context | Before | After |
|--------|--------|--------|
| Candidate chat, voice, onboarding, emails (user copy) | Aarya | **Hireschema AI** (short: “Hireschema” where length matters) |
| Recruiter agent / intake / faces | Nitya | **Removed** with recruiter product |
| System prompts (candidate agent) | “You are Aarya…” | “You are Hireschema AI…” |
| Component folders `components/aarya/*` | AaryaFace, etc. | Rename to neutral (`assistant/` or `hireschema-ai/`) **or** keep folder, change visible strings only if rename churn is too high — prefer rename for UI components |
| API agent directory | `agents/aarya/` | Keep path; update prompt strings and logs that leak to users |
| Storage keys `hireloop_*` | optional | Keep for backwards compat in Slice 1 |

Voice stack unchanged: Deepgram Nova-3 STT + Aura TTS → same LLM chat pipeline.

---

## Recruiter cut (aggressive)

### Frontend (`app/`)

- Delete or gut `app/src/app/recruiter/**` and `components/recruiter/**`, `RecruiterShell`, recruiter mobile nav, role-switch to recruiter.
- Signup: remove “Recruiter / Hiring Manager” path; Job Seeker only (or single “Continue” without role toggle).
- Auth destination: never `/recruiter`; bootstrap `role` forced/`candidate` only for new users.
- Landing/marketing components in `app` that pitch Nitya/recruiter: rewrite to candidate benefits.
- Public portfolio “recruiter bar” / apply-as-recruiter CTAs: remove or convert to “view only”.

### Backend (`api/`)

- Unregister / remove `routes/recruiter.py` from `main.py`.
- Stop Nitya LISTEN/NOTIFY workers used only for recruiter intake and HM cold-email if they have no candidate-only caller; keep candidate intro table only if still used for tracker-adjacent flows — **prefer**: keep `intro_requests` schema but disable recruiter-direction creation endpoints.
- Auth bootstrap: ignore or reject `role=recruiter` from clients.
- Lifecycle emails mentioning Nitya: rewrite or disable recruiter templates.

### Data

- Do **not** drop `recruiters` / `roles` tables in Slice 1 (migration risk). Soft-disable: no writers.
- Existing recruiter users: on login, treat as candidate or show a one-time “product is now candidate-only” message and force candidate onboarding — decision: **map to candidate** if a `candidates` row can be created; else block with support email.

---

## Candidate surface map (kept)

- `/signup`, `/onboarding`, `/dashboard` (+ chat/voice)
- Matches / jobs / tracker panels
- Profile, settings, resumes, kits, career path / intelligence (candidate)
- Mock interview / career call (rebranded copy)
- Privacy / terms (update agent names)

---

## Approaches considered

| Approach | Pros | Cons |
|----------|------|------|
| A. UI-string only | Fast | Leaves recruiter product live — rejected |
| B. Hide recruiter UI, keep API | Safer rollback | User chose delete |
| **C. Delete SPA + unregister API (this design)** | Matches lock | Higher churn; watch public/role edges |

**Chosen:** C for Slice 1, with DB tables retained.

---

## Implementation sequence (for plan)

1. Rebrand copy + prompts + emails (candidate-visible).
2. Signup/auth single-role candidate.
3. Delete recruiter SPA + shells + nav.
4. Unregister recruiter API + Nitya-only routes/workers safe to stop.
5. Fix redirects, gates, landing, tests.
6. Smoke: signup → chat “Hireschema AI” → matches → tracker.

---

## Risks

- **High:** Public role pages / invite links may 404 mid-cycle — document as intentional.
- **Medium:** Agent faces/components renaming breaks imports — do rename with codemod/checklist.
- **Medium:** Terms/privacy still mention Gmail intros / Nitya — update in same pass.
- **Rule note:** Historical India-only (R4) remains until Global slice; this Slice does not enable other markets yet.

---

## Success criteria

- [ ] Grep of user-facing `app/` strings: no standalone “Aarya” / “Nitya” in UI copy (tests may mention old names until updated).
- [ ] `/recruiter` and nested paths not reachable as product UI.
- [ ] `POST /api/v1/auth/bootstrap` does not create recruiter workspace for new signups.
- [ ] Candidate chat/voice still streams; welcome copy says Hireschema AI.
- [ ] CI candidate/unit suites green for touched packages.

---

## Follow-on slices (pointers only)

### Slice 2 — Global
- Markets multi-code, salaries/currency, phone OTP optional by region, job visibility, legal.

### Slice 3 — Chrome extension
- MV3 extension: extract job from LinkedIn / career pages → authenticated API → create tracker item (`job_applications` / saved jobs). Auth via token or cookie against `hireschema.com`.

---

## Open points resolved with user

- AI brand: **Hireschema AI**
- Recruiter: **delete** (not hide-only)
- First slice: **rebrand + cut** (not extension/global first)
