"""Unit tests for public CV review elite scorecard."""

from hireloop_api.services.public_cv_review import _gate_payload, _heuristic_review


def test_heuristic_review_returns_elite_scores() -> None:
    parsed = {
        "full_name": "Priya Sharma",
        "current_title": "Backend Engineer",
        "current_company": "Acme",
        "years_experience": 5,
        "skills": ["Python", "Postgres", "FastAPI", "Redis", "AWS", "Docker", "Kubernetes", "SQL"],
        "location_city": "Bengaluru",
        "summary": "Backend engineer shipping APIs.",
        "work_experience": [{"title": "Backend Engineer", "company": "Acme"}],
    }
    review = _heuristic_review(parsed)
    assert "scores" in review
    for key in (
        "relevance",
        "experience",
        "impact",
        "skills",
        "communication",
        "culture_fit",
        "overall",
    ):
        assert 0 <= review["scores"][key] <= 100
    assert len(review["priority_checks"]) == 8
    assert review["categories"]["relevance"]["weight"] == 40
    assert len(review["impact_rewrites"]) >= 2
    assert len(review["red_flags"]) >= 1


def test_gate_payload_is_free_full_scorecard() -> None:
    review = {
        "headline": "Strong base",
        "verdict": "Good CV with gaps.",
        "target_role_guess": "Backend Engineer",
        "priority_checks": [
            {
                "id": "headline",
                "label": "Headline",
                "looking_for": "Clear identity",
                "status": "strong",
                "note": "Clear title",
            }
        ],
        "categories": {
            "relevance": {"score": 70, "summary": "ok", "weight": 40},
            "impact": {"score": 60, "summary": "ok", "weight": 25},
            "credibility": {"score": 55, "summary": "ok", "weight": 15},
            "communication": {"score": 80, "summary": "ok", "weight": 10},
            "signals": {"score": 65, "summary": "ok", "weight": 10},
        },
        "scores": {
            "overall": 72,
            "relevance": 70,
            "experience": 68,
            "impact": 60,
            "skills": 75,
            "communication": 80,
            "culture_fit": 62,
        },
        "impact_rewrites": [
            {"weak": "Managed a team", "strong": "Led 12 people, +32% revenue"}
        ],
        "red_flags": ["No metrics"],
        "strengths": ["A", "B", "C"],
        "improvements": ["fix1", "fix2", "fix3"],
        "role_targets": ["Backend Engineer"],
        "model_used": "heuristic",
    }
    parsed = {"full_name": "Priya Sharma", "current_title": "Backend Engineer", "skills": ["Python"]}
    out = _gate_payload(review, parsed)
    assert out["kind"] == "public_cv_review"
    assert out["free"] is True
    assert out["scores"]["overall"] == 72
    assert out["improvements"] == ["fix1", "fix2", "fix3"]
    assert out["cta"]["primary_label"] == "Sign up free"
    assert out["privacy"]["stored"] is False
    assert "email" not in out["profile"]
