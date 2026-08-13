"""
Tests for Aarya's per-turn model routing (cost).

Flash is the default. Sonnet is reserved for intro drafts and profile/resume
advice. These are pure decisions — no LLM, no network.
"""

from __future__ import annotations

from langchain_core.messages import AIMessage

from hireloop_api.agents.aarya.agent import (
    _detect_likely_intent,
    _prefer_fast_model,
    route_after_agent,
)


def test_voice_job_search_uses_fast_model() -> None:
    assert _prefer_fast_model(
        voice_mode=True, last_human_text="find me backend jobs", has_tool_results=False
    )


def test_voice_synthesis_uses_fast_model() -> None:
    assert _prefer_fast_model(
        voice_mode=True, last_human_text="find me backend jobs", has_tool_results=True
    )


def test_tool_result_summarisation_uses_fast_model() -> None:
    assert _prefer_fast_model(
        voice_mode=False, last_human_text="thanks, that helps", has_tool_results=True
    )


def test_job_search_uses_fast_model() -> None:
    assert _prefer_fast_model(
        voice_mode=False, last_human_text="find me backend jobs", has_tool_results=True
    )
    assert _prefer_fast_model(
        voice_mode=False, last_human_text="find backend engineer jobs", has_tool_results=False
    )


def test_intro_turn_uses_primary_model() -> None:
    assert not _prefer_fast_model(
        voice_mode=False,
        last_human_text="can you connect me with the hiring manager?",
        has_tool_results=False,
    )


def test_general_chat_uses_fast_model() -> None:
    assert _prefer_fast_model(
        voice_mode=False, last_human_text="hi, can you help me?", has_tool_results=False
    )


def test_preference_statement_uses_fast_model() -> None:
    assert _detect_likely_intent("my expected ctc is 20 lpa") == "preference_update"
    assert _prefer_fast_model(
        voice_mode=False, last_human_text="my expected ctc is 20 lpa", has_tool_results=False
    )


def test_job_application_uses_fast_model() -> None:
    assert (
        _detect_likely_intent(
            "I want to apply for Senior Engineer at Acme. "
            "Prepare my full application kit for job abc-123."
        )
        == "job_application"
    )
    assert _prefer_fast_model(
        voice_mode=False,
        last_human_text="I want to apply for this role",
        has_tool_results=False,
    )


def test_profile_improvement_uses_primary_model() -> None:
    assert (
        _detect_likely_intent("What should I add to improve my match quality?")
        == "profile_improvement"
    )
    assert not _prefer_fast_model(
        voice_mode=False,
        last_human_text="What should I add to improve my match quality?",
        has_tool_results=False,
    )
    assert not _prefer_fast_model(
        voice_mode=False,
        last_human_text="What should I add to improve my match quality?",
        has_tool_results=True,
    )


def test_specific_job_fit_question_is_not_routed_to_job_search() -> None:
    prompt = (
        "Why is Associate Manager - Revenue Growth Management at PepsiCo, Inc. "
        "a fit for me? Use job id 524c5c60-498c-4dec-bb59-2b3ee98525ed."
    )
    assert _detect_likely_intent(prompt) == "match_explanation"
    assert _prefer_fast_model(voice_mode=False, last_human_text=prompt, has_tool_results=False)


def test_default_models_are_valid_openrouter_ids() -> None:
    from hireloop_api.config import Settings

    s = Settings(_env_file=None, environment="development")  # type: ignore[call-arg]
    assert s.openrouter_primary_model == "anthropic/claude-sonnet-4.6"
    assert s.openrouter_fallback_model == "google/gemini-2.5-flash"
    assert s.openrouter_fast_model == "google/gemini-2.5-flash"
    assert s.openrouter_free_model == "openrouter/free"
    assert s.openrouter_chat_max_tokens <= 700
    assert s.openrouter_low_credit_max_tokens <= 256
    assert s.chat_turns_per_day == 20
    assert s.chat_turns_per_hour == 8
    for model in (
        s.openrouter_primary_model,
        s.openrouter_fallback_model,
        s.openrouter_fast_model,
    ):
        assert "/" in model
        assert "latest" not in model


def test_text_chat_has_tool_round_circuit_breaker() -> None:
    state = {
        "messages": [
            AIMessage(
                content="",
                tool_calls=[
                    {
                        "id": "call_1",
                        "name": "job_search",
                        "args": {"query_text": "sales"},
                    }
                ],
            )
        ],
        "voice_mode": False,
        "tool_rounds": 3,
    }

    assert route_after_agent(state) == "__end__"
