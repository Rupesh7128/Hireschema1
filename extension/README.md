# Hireschema Chrome extension — Save job + application kit

Save the job you’re viewing (LinkedIn / Greenhouse / Lever / Ashby / Workday, or any page) into your Hireschema **job tracker**, optionally queue an **application kit**.

## Load unpacked (dev)

1. Start API (`localhost:8000`) and app (`localhost:3001`).
2. In extension **Settings**, set API base to `http://localhost:8000` and app origin to `http://localhost:3001`.
3. Chrome → **Extensions** → **Developer mode** → **Load unpacked** → select this `extension/` folder.
4. Click the extension → **Sign in** → complete `/extension/connect` while logged into Hireschema.
5. Open a job page → **Save this job** or **Save + prepare kit**.

## Production defaults

Shipped defaults (override in Settings):

- **API base** — `https://hireschema1.vercel.app/hireloop-api`
- **App origin** — `https://hireschema1.vercel.app`

## Actions

| Button | Behaviour |
|---|---|
| Save this job | Upserts job + `saved_jobs`; if “Also prepare kit when I save” is on, enqueues kit and opens dashboard |
| Save + prepare kit | Always save then `POST /application-kits/jobs/{id}/prepare` + open kit deep-link |
| Open tracker | Dashboard → Saved jobs |

## API

- `POST /api/v1/extension/jobs/save` (Bearer Supabase JWT)
- `POST /api/v1/application-kits/jobs/{job_id}/prepare`

## v2 ideas (not in this build)

- Score this JD vs profile
- Clipboard assist for ATS forms
- Mark Applied from the popup
- Detect application forms → nudge kit
