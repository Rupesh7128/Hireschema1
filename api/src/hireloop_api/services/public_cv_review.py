"""Anonymous CV review for /reviewmycv — free elite-recruiter scorecard."""

from __future__ import annotations

import asyncio
import json
import re
from typing import Any

import httpx
import structlog

from hireloop_api.config import Settings
from hireloop_api.services.chat_analysis import analyze_resume_parsed
from hireloop_api.services.resume_parser import ResumeParserService
from hireloop_api.services.role_inbound import parse_resume_bytes

logger = structlog.get_logger()

_JSON_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE | re.MULTILINE)

_PRIORITY_ORDER = [
    ("headline", "Headline", 'Clear identity ("Software Engineer", "Product Designer")'),
    ("work_experience", "Work experience", "Relevant roles and responsibilities"),
    ("achievements", "Achievements", "Measurable impact"),
    ("skills", "Skills", "Skills that match target roles"),
    ("projects", "Projects", "Real-world work and proof of ability"),
    ("education", "Education", "Degree, certifications, and relevance"),
    ("stability", "Stability", "Frequent job changes or unexplained gaps"),
    ("presentation", "Presentation", "Readability and professionalism"),
]

_CATEGORY_WEIGHTS = {
    "relevance": 40,
    "impact": 25,
    "credibility": 15,
    "communication": 10,
    "signals": 10,
}

_SYSTEM = """You are an elite recruiter at a large technology company screening a CV.
Score like FAANG / big-tech sourcers. Be direct. No fluff. Scores are integers 0-100.
Never invent employers, degrees, metrics, or links not supported by the CV text.
Never include email, phone, or full address.

Return ONLY valid JSON:
{
  "headline": "one punchy recruiter line (max 100 chars)",
  "verdict": "3-4 sentences: overall hiring read",
  "target_role_guess": "best-fit title from the CV",
  "priority_checks": [
    {
      "id": "headline|work_experience|achievements|skills|projects|education|stability|presentation",
      "status": "strong|needs_work|missing",
      "note": "one concrete observation (max 120 chars)"
    }
  ],
  "categories": {
    "relevance": {"score": 0-100, "summary": "fit / similar problems / industry / seniority"},
    "impact": {"score": 0-100, "summary": "quantified outcomes vs duty lists"},
    "credibility": {"score": 0-100, "summary": "brand names, promotions, awards, certs, OSS"},
    "communication": {"score": 0-100, "summary": "clarity, length, formatting, buzzwords"},
    "signals": {"score": 0-100, "summary": "leadership, ownership, learning speed"}
  },
  "scores": {
    "relevance": 0-100,
    "experience": 0-100,
    "impact": 0-100,
    "skills": 0-100,
    "communication": 0-100,
    "culture_fit": 0-100,
    "overall": 0-100
  },
  "impact_rewrites": [
    {"weak": "duty-style line from or typical of this CV", "strong": "metric rewrite"}
  ],
  "red_flags": ["specific flags found on THIS CV"],
  "strengths": ["3 concrete strengths"],
  "improvements": ["4-6 concrete fixes, most urgent first"],
  "role_targets": ["3 titles this CV could chase"]
}

priority_checks MUST include all 8 ids exactly once.
impact_rewrites: 2 items when possible.
overall hiring score ≈ weighted: relevance*0.40 + impact*0.25 + credibility*0.15 + communication*0.10 + signals*0.10 (then adjust ±5 for experience depth).
"""


def _clamp_score(value: Any, default: int = 55) -> int:
    try:
        n = round(float(value))
    except (TypeError, ValueError):
        return default
    return max(0, min(100, int(n)))


def _first_name(full_name: str | None) -> str | None:
    if not full_name or not str(full_name).strip():
        return None
    token = str(full_name).strip().split()[0]
    return token[:40] if token else None


def _str_list(value: Any, *, limit: int, max_len: int) -> list[str]:
    if not isinstance(value, list):
        return []
    out: list[str] = []
    for item in value:
        text = str(item).strip()
        if text:
            out.append(text[:max_len])
        if len(out) >= limit:
            break
    return out


def _weighted_overall(categories: dict[str, Any]) -> int:
    total = 0.0
    weight_sum = 0
    for key, weight in _CATEGORY_WEIGHTS.items():
        block = categories.get(key) if isinstance(categories.get(key), dict) else {}
        total += _clamp_score(block.get("score"), 55) * (weight / 100)
        weight_sum += weight
    if weight_sum <= 0:
        return 55
    return _clamp_score(round(total), 55)


def _heuristic_review(parsed: dict[str, Any]) -> dict[str, Any]:
    """Rule-based elite scorecard when LLM is unavailable."""
    analysis = analyze_resume_parsed(parsed)
    profile = analysis.get("profile") or {}
    title = profile.get("current_title") or "your current role"
    skills = profile.get("skills") or []
    years = profile.get("years_experience")
    has_summary = bool(parsed.get("summary") or parsed.get("headline"))
    work = parsed.get("work_experience") or []
    gaps = list(analysis.get("gaps") or [])
    weak = list(analysis.get("weak_spots") or [])

    relevance = 72 if title and years else 48
    impact = 68 if years and len(skills) >= 5 else 45
    credibility = 70 if parsed.get("current_company") else 50
    communication = 74 if has_summary else 55
    signals = 66 if years and years >= 3 else 50
    experience = 70 if years else 45
    skills_score = min(92, 40 + len(skills) * 5)
    culture = 62 if profile.get("location_city") else 55

    categories = {
        "relevance": {
            "score": relevance,
            "summary": f"Title/seniority read for {title}; confirm role family fit on applications.",
            "weight": 40,
        },
        "impact": {
            "score": impact,
            "summary": "Duty language is common — recruiters need metrics (%, ₹, users, time).",
            "weight": 25,
        },
        "credibility": {
            "score": credibility,
            "summary": "Company + role present; promotions/awards/certs would lift trust fast.",
            "weight": 15,
        },
        "communication": {
            "score": communication,
            "summary": "Structure is readable enough for a first screen; tighten length and buzzwords.",
            "weight": 10,
        },
        "signals": {
            "score": signals,
            "summary": "Ownership and leadership signals need clearer proof in bullets.",
            "weight": 10,
        },
    }
    overall = _weighted_overall(categories)

    priority_checks = [
        {
            "id": "headline",
            "label": "Headline",
            "looking_for": 'Clear identity ("Software Engineer", "Product Designer")',
            "status": "strong" if title else "missing",
            "note": title if title else "Add a clear professional headline",
        },
        {
            "id": "work_experience",
            "label": "Work experience",
            "looking_for": "Relevant roles and responsibilities",
            "status": "strong" if work else "needs_work",
            "note": f"{len(work)} role(s) detected" if work else "Work history looks thin",
        },
        {
            "id": "achievements",
            "label": "Achievements",
            "looking_for": "Measurable impact",
            "status": "needs_work",
            "note": "Add quantified outcomes to top bullets",
        },
        {
            "id": "skills",
            "label": "Skills",
            "looking_for": "Skills that match target roles",
            "status": "strong" if len(skills) >= 6 else "needs_work",
            "note": f"{len(skills)} skills listed" if skills else "Expand concrete skills",
        },
        {
            "id": "projects",
            "label": "Projects",
            "looking_for": "Real-world work and proof of ability",
            "status": "needs_work",
            "note": "Surface 1–2 proof projects with outcomes",
        },
        {
            "id": "education",
            "label": "Education",
            "looking_for": "Degree, certifications, and relevance",
            "status": "needs_work",
            "note": "Keep education concise and role-relevant",
        },
        {
            "id": "stability",
            "label": "Stability",
            "looking_for": "Frequent job changes or unexplained gaps",
            "status": "strong" if years else "needs_work",
            "note": "No major gap signals from parse — still label dates clearly",
        },
        {
            "id": "presentation",
            "label": "Presentation",
            "looking_for": "Readability and professionalism",
            "status": "strong" if has_summary else "needs_work",
            "note": "Keep layout simple; avoid dense paragraphs",
        },
    ]

    improvements = [*weak, *[f"Add missing: {g}" for g in gaps]]
    if len(improvements) < 4:
        improvements.extend(
            [
                "Replace duty verbs with metrics (%, ₹, users, time saved)",
                "Lead with a clear identity headline matching target roles",
                "Add LinkedIn / GitHub / portfolio links if missing",
                "Cut generic buzzwords and AI-sounding filler",
            ]
        )

    return {
        "headline": f"Hiring score {overall}/100 — tighten impact to stand out for {title}",
        "verdict": (
            "An elite recruiter scans headline → experience → achievements first. "
            "This CV has enough structure for a first pass, but measurable impact and "
            "credibility signals decide whether you clear the screen. "
            "Fix quantification and role-targeted skills before applying at scale."
        ),
        "target_role_guess": str(title),
        "priority_checks": priority_checks,
        "categories": categories,
        "scores": {
            "relevance": relevance,
            "experience": experience,
            "impact": impact,
            "skills": skills_score,
            "communication": communication,
            "culture_fit": culture,
            "overall": overall,
        },
        "impact_rewrites": [
            {
                "weak": "Responsible for managing a team.",
                "strong": "Led a team of 12 and increased revenue by 32%.",
            },
            {
                "weak": "Worked on marketing campaigns.",
                "strong": "Reduced customer acquisition cost by 18% across 3 campaigns.",
            },
        ],
        "red_flags": [
            "Limited quantified achievements",
            "Generic statements without outcomes",
            *([f"Missing: {g}" for g in gaps[:3]]),
        ][:6],
        "strengths": (analysis.get("strengths") or [])[:3]
        or [
            "Enough structure for an automated first screen",
            "Role signals present to start matching",
            "Ready for deeper coaching after signup",
        ],
        "improvements": improvements[:6],
        "role_targets": [
            str(title),
            "Senior variant of your current title",
            "Adjacent IC role in a product company",
        ],
        "model_used": "heuristic",
    }


def _extract_json(content: str) -> dict[str, Any] | None:
    text = _JSON_FENCE.sub("", (content or "").strip()).strip()
    start, end = text.find("{"), text.rfind("}")
    if not (0 <= start < end):
        return None
    try:
        obj = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None
    return obj if isinstance(obj, dict) else None


def _normalize_priority_checks(raw: Any) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    if isinstance(raw, list):
        for item in raw:
            if not isinstance(item, dict):
                continue
            pid = str(item.get("id") or "").strip()
            if not pid:
                continue
            status = str(item.get("status") or "needs_work").strip().lower()
            if status not in {"strong", "needs_work", "missing"}:
                status = "needs_work"
            by_id[pid] = {
                "id": pid,
                "status": status,
                "note": str(item.get("note") or "").strip()[:140],
            }

    out: list[dict[str, Any]] = []
    for pid, label, looking_for in _PRIORITY_ORDER:
        hit = by_id.get(pid) or {
            "id": pid,
            "status": "needs_work",
            "note": "Not enough signal to score confidently",
        }
        out.append(
            {
                "id": pid,
                "label": label,
                "looking_for": looking_for,
                "status": hit["status"],
                "note": hit["note"] or looking_for,
            }
        )
    return out


def _normalize_categories(raw: Any) -> dict[str, Any]:
    src = raw if isinstance(raw, dict) else {}
    out: dict[str, Any] = {}
    defaults = {
        "relevance": "Does this CV fit the roles it implies?",
        "impact": "Are outcomes measured, or only duties listed?",
        "credibility": "Brand names, promotions, awards, certs, proof.",
        "communication": "Clarity, formatting, length, buzzwords.",
        "signals": "Ownership, leadership, learning speed.",
    }
    for key, weight in _CATEGORY_WEIGHTS.items():
        block = src.get(key) if isinstance(src.get(key), dict) else {}
        out[key] = {
            "score": _clamp_score(block.get("score"), 55),
            "summary": str(block.get("summary") or defaults[key]).strip()[:220],
            "weight": weight,
        }
    return out


def _normalize_impact_rewrites(raw: Any) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    if isinstance(raw, list):
        for item in raw:
            if not isinstance(item, dict):
                continue
            weak = str(item.get("weak") or "").strip()[:160]
            strong = str(item.get("strong") or "").strip()[:180]
            if weak and strong:
                out.append({"weak": weak, "strong": strong})
            if len(out) >= 3:
                break
    if len(out) < 2:
        out.extend(
            [
                {
                    "weak": "Responsible for managing a team.",
                    "strong": "Led a team of 12 people and increased revenue by 32%.",
                },
                {
                    "weak": "Worked on marketing campaigns.",
                    "strong": "Reduced customer acquisition costs by 18%.",
                },
            ]
        )
    return out[:3]


def _normalize_llm_review(raw: dict[str, Any], *, model_used: str) -> dict[str, Any]:
    categories = _normalize_categories(raw.get("categories"))
    scores_in = raw.get("scores") if isinstance(raw.get("scores"), dict) else {}
    overall = _clamp_score(scores_in.get("overall"), _weighted_overall(categories))
    scores = {
        "relevance": _clamp_score(
            scores_in.get("relevance"), categories["relevance"]["score"]
        ),
        "experience": _clamp_score(scores_in.get("experience"), 55),
        "impact": _clamp_score(scores_in.get("impact"), categories["impact"]["score"]),
        "skills": _clamp_score(scores_in.get("skills"), 55),
        "communication": _clamp_score(
            scores_in.get("communication"), categories["communication"]["score"]
        ),
        "culture_fit": _clamp_score(scores_in.get("culture_fit"), 55),
        "overall": overall,
    }
    strengths = _str_list(raw.get("strengths"), limit=3, max_len=160)
    improvements = _str_list(raw.get("improvements"), limit=6, max_len=180)
    role_targets = _str_list(raw.get("role_targets"), limit=3, max_len=80)
    red_flags = _str_list(raw.get("red_flags"), limit=8, max_len=140)
    if len(strengths) < 2:
        strengths = [*strengths, "Enough structure for a first recruiter screen"][:3]
    if len(improvements) < 2:
        improvements = [
            *improvements,
            "Add quantified impact to your top 3 bullets",
            "Lead with a clear identity headline",
        ][:6]
    if not red_flags:
        red_flags = ["Limited quantified achievements"]

    return {
        "headline": str(raw.get("headline") or "Recruiter read complete").strip()[:100],
        "verdict": str(raw.get("verdict") or "").strip()[:700]
        or "A sharp recruiter pass: keep what works, fix the gaps below.",
        "target_role_guess": str(raw.get("target_role_guess") or "").strip()[:80] or None,
        "priority_checks": _normalize_priority_checks(raw.get("priority_checks")),
        "categories": categories,
        "scores": scores,
        "impact_rewrites": _normalize_impact_rewrites(raw.get("impact_rewrites")),
        "red_flags": red_flags,
        "strengths": strengths[:3],
        "improvements": improvements[:6],
        "role_targets": role_targets[:3],
        "model_used": model_used,
    }


async def _llm_review(
    settings: Settings,
    *,
    cv_text: str,
    parsed: dict[str, Any],
) -> dict[str, Any] | None:
    if not settings.openrouter_api_key:
        return None

    brief = {
        "full_name": parsed.get("full_name"),
        "current_title": parsed.get("current_title") or parsed.get("headline"),
        "current_company": parsed.get("current_company"),
        "years_experience": parsed.get("years_experience"),
        "skills": (parsed.get("skills") or [])[:16],
        "location_city": parsed.get("location_city"),
    }
    user = (
        "Score this CV with the elite recruiter framework "
        "(priority scan → 5 weighted categories → hiring scores).\n\n"
        "PARSED SIGNALS (may be incomplete):\n"
        f"{json.dumps(brief, ensure_ascii=False)}\n\n"
        "CV TEXT (truncated):\n"
        f"{cv_text[:9000]}"
    )

    models: list[tuple[str, str]] = []
    free = (settings.openrouter_free_model or "").strip()
    fast = (
        settings.openrouter_fast_model or settings.openrouter_fallback_model or ""
    ).strip()
    if free:
        models.append(("openrouter_free", free))
    if fast and fast != free:
        models.append(("openrouter_fast", fast))
    if not models:
        return None

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://hireschema.com",
        "X-Title": "Hireschema - Public CV Review",
    }

    async with httpx.AsyncClient(timeout=35.0) as client:
        for label, model in models:
            try:
                resp = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json={
                        "model": model,
                        "temperature": 0.3,
                        "max_tokens": 1600,
                        "messages": [
                            {"role": "system", "content": _SYSTEM},
                            {"role": "user", "content": user},
                        ],
                    },
                )
                if resp.status_code != 200:
                    logger.warning(
                        "public_cv_review_llm_http",
                        model=model,
                        status=resp.status_code,
                        body=resp.text[:200],
                    )
                    continue
                content = (
                    resp.json()
                    .get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")
                )
                raw = _extract_json(content if isinstance(content, str) else str(content))
                if not raw:
                    continue
                return _normalize_llm_review(raw, model_used=label)
            except Exception as exc:
                logger.warning(
                    "public_cv_review_llm_failed",
                    model=model,
                    error=str(exc)[:240],
                )
                continue
    return None


def _gate_payload(review: dict[str, Any], parsed: dict[str, Any]) -> dict[str, Any]:
    """Public free review — full scorecard; signup is for the product loop."""
    profile = {
        "first_name": _first_name(parsed.get("full_name")),
        "current_title": parsed.get("current_title") or parsed.get("headline"),
        "years_experience": parsed.get("years_experience"),
        "skill_count": len(parsed.get("skills") or []),
        "location_city": parsed.get("location_city"),
    }
    return {
        "kind": "public_cv_review",
        "free": True,
        "headline": review.get("headline"),
        "verdict": review.get("verdict"),
        "target_role_guess": review.get("target_role_guess"),
        "priority_checks": review.get("priority_checks") or [],
        "categories": review.get("categories") or {},
        "scores": review.get("scores") or {},
        "impact_rewrites": review.get("impact_rewrites") or [],
        "red_flags": review.get("red_flags") or [],
        "strengths": (review.get("strengths") or [])[:3],
        "improvements": (review.get("improvements") or [])[:6],
        "role_targets": (review.get("role_targets") or [])[:3],
        "profile": profile,
        "cta": {
            "title": "Ready to act on this review?",
            "body": (
                "Create a free Hireschema account to get matched India roles, "
                "tailored application kits, and warm intros from your Gmail."
            ),
            "primary_label": "Sign up free",
            "secondary_label": "Log in",
        },
        "model_used": review.get("model_used"),
        "privacy": {
            "stored": False,
            "note": "Free review — your file is scored in memory and not saved until you sign up.",
        },
    }


async def review_cv_bytes(
    file_bytes: bytes,
    *,
    filename: str,
    mime_type: str | None,
    settings: Settings,
) -> dict[str, Any]:
    """Parse CV in-memory and return a free elite-recruiter review."""
    parsed = await asyncio.to_thread(
        parse_resume_bytes,
        file_bytes,
        filename=filename,
        mime_type=mime_type,
    )
    cv_text = await asyncio.to_thread(
        ResumeParserService._extract_text,
        file_bytes,
        filename,
        mime_type,
    )
    review = await _llm_review(settings, cv_text=cv_text or "", parsed=parsed)
    if review is None:
        review = _heuristic_review(parsed)
    return _gate_payload(review, parsed)
