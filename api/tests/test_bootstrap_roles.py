from hireloop_api.services.bootstrap_roles import can_switch_roles, resolve_bootstrap_role


def test_bootstrap_always_candidate_even_if_recruiter_requested() -> None:
    assert resolve_bootstrap_role("recruiter", has_recruiter=False) == "candidate"
    assert resolve_bootstrap_role("recruiter", has_recruiter=True) == "candidate"


def test_candidate_request_stays_candidate() -> None:
    assert resolve_bootstrap_role("candidate", has_recruiter=True) == "candidate"
    assert resolve_bootstrap_role("candidate", has_recruiter=False) == "candidate"


def test_can_switch_roles_requires_both() -> None:
    assert can_switch_roles(True, True) is True
    assert can_switch_roles(True, False) is False
