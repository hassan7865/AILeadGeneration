"""Email types for API schemas.

Pydantic's EmailStr uses email-validator, which rejects RFC 6761 special-use
names such as ``*.local``. Local / mDNS-style addresses are common in dev; we
validate those with a syntax-only path and keep strict validation for all
other domains (no deliverability checks on either path).
"""

from __future__ import annotations

import re
from typing import Annotated

from email_validator import EmailNotValidError, validate_email
from pydantic import AfterValidator, WithJsonSchema

# Simplified RFC 5321-ish checks for ASCII dev emails (e.g. user@host.local).
_LOCAL_PART_RE = re.compile(r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$")
_DOMAIN_LABEL_RE = re.compile(
    r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$"
)


def _is_reserved_local_style_domain(domain: str) -> bool:
    d = domain.rstrip(".").lower()
    return d == "local" or d.endswith(".local")


def validate_account_email(value: str) -> str:
    if not isinstance(value, str):
        raise TypeError("Email must be a string")
    raw = value.strip()
    if not raw:
        raise ValueError("Email is required")
    if raw.count("@") != 1:
        raise ValueError("Invalid email address")

    local, _, domain = raw.partition("@")
    domain = domain.rstrip(".").strip()
    local = local.strip()
    if not local or not domain:
        raise ValueError("Invalid email address")

    normalized_local = local.lower()
    normalized_domain = domain.lower()

    if len(normalized_local) > 64 or len(normalized_domain) > 253:
        raise ValueError("Invalid email address")

    if _is_reserved_local_style_domain(normalized_domain):
        if not _LOCAL_PART_RE.fullmatch(normalized_local):
            raise ValueError("Invalid email address")
        if not _DOMAIN_LABEL_RE.fullmatch(normalized_domain):
            raise ValueError("Invalid email address")
        return f"{normalized_local}@{normalized_domain}"

    try:
        parsed = validate_email(raw, check_deliverability=False)
        return parsed.normalized
    except EmailNotValidError as exc:
        raise ValueError("Invalid email address") from exc


AccountEmail = Annotated[
    str,
    AfterValidator(validate_account_email),
    WithJsonSchema({"type": "string", "format": "email"}),
]
