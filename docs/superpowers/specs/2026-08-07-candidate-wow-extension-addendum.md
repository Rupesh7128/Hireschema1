# Design addendum: Candidate wow loop + Chrome extension kit

**Date:** 2026-08-07  
**Status:** Implemented locally (phases 1–4)

## Shipped

1. **Guaranteed matches** — `fetch_instant_shelf` persists all shelf cards to `match_scores`; dashboard opens Matches on starter seed with “Based on your CV — N roles…”; MatchFeed skips empty-poll when seeded and auto-asks AI once if still empty.
2. **Intro draft-first** — draft shown before Gmail connect; Request Intro opens Intros panel + toast about Gmail; connect is the send gate.
3. **One-tap application kit** — visible **Application kit** on JobCard; `useJobCardAssets` prepares in-place; `KitDoneMoment` share modal + toast.
4. **Extension** — prod defaults to hireschema1; Save + prepare kit; auto-kit toggle; opens dashboard kit deep-link; Saved list tags **Saved from Chrome**.

## Extension v2 backlog

| Idea | Why candidates love it |
|---|---|
| Score this JD vs my profile | Instant fit % + gaps on any posting |
| Clipboard assist | Copy tailored resume/cover into ATS fields |
| Mark Applied from popup | Tracker stays truthful without leaving LinkedIn |
| Detect application form → nudge kit | Right-time CTA |
| Capture salary/visa/notice from page | Enrich profile/job without typing |
| Sidebar “Hireschema” while browsing | Persistent coach without popup |
| WhatsApp/email ping when kit ready | Close the loop off-browser |
