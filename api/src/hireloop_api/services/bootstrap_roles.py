"""Resolve effective account role during OAuth/email bootstrap."""


def can_switch_roles(has_candidate: bool, has_recruiter: bool) -> bool:
    """True when the same login has both profile rows."""
    return has_candidate and has_recruiter


def resolve_bootstrap_role(requested_role: str, *, has_recruiter: bool) -> str:
    """
    Pick the role written to public.users during bootstrap.

    Product is candidate-only: always return ``candidate`` regardless of
    client-requested role or existing recruiter rows.
    """
    _ = requested_role, has_recruiter
    return "candidate"
