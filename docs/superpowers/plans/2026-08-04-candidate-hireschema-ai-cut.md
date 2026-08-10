# Candidate-only cut + Hireschema AI rebrand — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Slice 1 — candidate-only product with user-facing agent branded **Hireschema AI**, recruiter SPA/API removed, Deepgram voice + chat + tracker kept.

**Architecture:** Update candidate-visible copy and system prompts first; force auth/bootstrap to candidate; delete `app/src/app/recruiter/**` and unregister `routes/recruiter.py`; leave DB tables and `agents/aarya` module paths in place for Slice 1. Global markets + Chrome extension are deferred.

**Tech Stack:** Next.js 15 (`app/`), FastAPI (`api/`), existing Aarya agent + Deepgram voice (unchanged providers).

**Spec:** `docs/superpowers/specs/2026-08-04-candidate-global-rebrand-cut-design.md`

---

## File map (primary)

| Area | Paths |
|------|--------|
| Agent prompts | `api/src/hireloop_api/agents/aarya/agent.py`, chat system prompts in `routes/chat.py` / related |
| Voice copy | `app/src/app/voice/VoiceSession.tsx`, `ChatInterface.tsx`, `CareerCallConsent.tsx`, `InThreadCallBanner.tsx` |
| Brand components | `app/src/components/aarya/*` → prefer rename to `components/hireschema-ai/` |
| Auth / signup | `app/src/app/signup/page.tsx`, `lib/auth/*`, `api/.../routes/auth.py` |
| Recruiter SPA | `app/src/app/recruiter/**`, `components/recruiter/**`, `layout/RecruiterShell.tsx`, `RecruiterMobileNav.tsx` |
| API cut | `api/src/hireloop_api/main.py`, `routes/recruiter.py` |
| Emails | `api/.../services/email/lifecycle_templates.py` |
| Legal / landing | `app/src/app/privacy/page.tsx`, `terms/page.tsx`, `components/landing/*` |
| Tests | Vitest/chat smokes mentioning Aarya; API tests importing recruiter routes |

---

### Task 1: Candidate-visible string + prompt rebrand (Hireschema AI)

**Files:**
- Modify: agent / chat / voice / onboarding / email templates listed above
- Test: `app/src/components/chat/CareerCall.smoke.test.tsx` (and any Aarya string asserts)

- [ ] **Step 1: Inventory user-facing Aarya/Nitya strings**

Run from repo root:

```bash
rg -n "Aarya|Nitya" app/src api/src/hireloop_api/agents api/src/hireloop_api/services/email api/src/hireloop_api/routes/chat.py --glob '*.{tsx,ts,py}' | head -100
```

- [ ] **Step 2: Update system prompts**

In `agents/aarya/agent.py` (and any “You are Aarya” strings in chat/career interview services), replace with **Hireschema AI**. Keep behavioral instructions otherwise identical.

- [ ] **Step 3: Update SPA copy**

Replace visible “Aarya” → “Hireschema AI” (or “Hireschema” in tight UI). Remove Nitya from any candidate-facing path. Prefer renaming `components/aarya/AaryaFace.tsx` exports to neutral names and updating imports.

- [ ] **Step 4: Update lifecycle email copy**

`lifecycle_templates.py`: welcome / match emails should not say Aarya/Nitya; use Hireschema AI / Hireschema.

- [ ] **Step 5: Fix broken tests for renamed strings**

```bash
cd app && pnpm exec vitest run src/components/chat --passWithNoTests
cd ../api && uv run pytest tests/ -q -k 'welcome or lifecycle or chat' --tb=line
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "$(cat <<'EOF'
refactor(brand): rename candidate agent to Hireschema AI in user-facing copy

EOF
)"
```

---

### Task 2: Auth + signup = candidate only

**Files:**
- Modify: `app/src/app/signup/page.tsx`, `lib/auth/constants.ts`, `post-auth-destination.ts`, `AuthCallbackClient.tsx`
- Modify: `api/src/hireloop_api/routes/auth.py`, `services/bootstrap_roles.py` if present

- [ ] **Step 1: Remove recruiter toggle from signup UI**

Single path: Job Seeker / candidate. No “Recruiter / Hiring Manager” CTA.

- [ ] **Step 2: Bootstrap always candidate for new users**

`POST /api/v1/auth/bootstrap`: ignore/reject `role=recruiter` from clients; effective role `candidate`. Document in route docstring.

- [ ] **Step 3: Post-auth destination**

Never redirect to `/recruiter*`. Use `/onboarding` or `/dashboard` only.

- [ ] **Step 4: Add/adjust unit test for bootstrap role**

```bash
cd api && uv run pytest tests/test_bootstrap_roles.py tests/test_candidate_bootstrap.py -q --tb=short
```

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(auth): candidate-only signup and bootstrap

EOF
)"
```

---

### Task 3: Delete recruiter SPA

**Files:**
- Delete: `app/src/app/recruiter/**`
- Delete or stop exporting: `components/recruiter/**`, `RecruiterShell`, `RecruiterMobileNav`, recruiter nav helpers
- Modify: `middleware` / gates that reference recruiter; landing pages

- [ ] **Step 1: Remove recruiter routes from App Router**

Delete the `app/recruiter` tree. Grep for `@/app/recruiter` and `/recruiter` imports; fix or remove.

- [ ] **Step 2: Remove shells and role switch**

Strip `RoleSwitchButton` recruiter path; ensure `AppShell` / candidate nav only.

- [ ] **Step 3: Landing / public portfolio**

Remove Nitya/recruiter CTAs; candidate messaging only.

- [ ] **Step 4: Typecheck**

```bash
cd app && pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
chore(app): remove recruiter SPA for candidate-only product

EOF
)"
```

---

### Task 4: Unregister recruiter API + stop recruiter-only workers

**Files:**
- Modify: `api/src/hireloop_api/main.py`
- Optional keep file but unused: `routes/recruiter.py` (prefer delete if no imports)
- Review: Nitya agent startup / LISTEN only used for recruiter or HM intros — disable recruiter intake; leave HM intro path only if still candidate-triggered (can stay for later; do not invest)

- [ ] **Step 1: Remove router include for recruiter**

Confirm OpenAPI no longer lists `/api/v1/recruiter*`.

- [ ] **Step 2: Delete or quarantine `routes/recruiter.py` and `agents/nitya/recruiter_chat.py` call sites**

Update tests that imported recruiter routes (skip or delete).

- [ ] **Step 3: Run API tests**

```bash
cd api && uv run pytest tests/ -q --tb=line -x
```

Fix failures caused by missing recruiter modules (delete obsolete tests rather than restoring product).

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
chore(api): drop recruiter routes for candidate-only MVP

EOF
)"
```

---

### Task 5: Legal + smoke gate

**Files:**
- Modify: `app/src/app/privacy/page.tsx`, `terms/page.tsx`
- Optional: `PHASE_TRACKER.md` note Slice 1 done / recruiter deferred-killed

- [ ] **Step 1: Update privacy/terms agent and audience language**

Candidate + Hireschema AI; remove recruiter/Nitya promises that are no longer true.

- [ ] **Step 2: Manual smoke checklist**

1. Signup (no recruiter option)  
2. Onboarding  
3. Dashboard chat shows Hireschema AI  
4. Mic path still reaches Deepgram/chat  
5. `/recruiter` → 404  

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
docs: align privacy/terms with candidate-only Hireschema AI

EOF
)"
```

---

## Deferred (do not implement in this plan)

- **Slice 2 — Global markets:** `ENABLED_MARKETS`, India DB CHECKs, currency, phone OTP.
- **Slice 3 — Chrome extension:** MV3 save-job → tracker API.
- Internal rename `agents/aarya` package → `agents/hireschema`.
- Drop `recruiters` / `roles` tables.

---

## Done when

- User-facing Aarya/Nitya gone from candidate product.
- Recruiter UI and API surface gone.
- Candidate chat/voice/tracker still work.
- Spec success criteria checked off.
