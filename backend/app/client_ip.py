"""Resolve the client IP safely for login rate limiting on Render."""

import ipaddress
import os

from fastapi import HTTPException, Request


_UNAVAILABLE = HTTPException(
    status_code=503,
    detail="Authentication temporarily unavailable",
)


def get_client_ip(request: Request) -> str:
    """Return a validated client IP.

    Render routes public traffic through Cloudflare. In Render, trust only the
    single CF-Connecting-IP address supplied by that edge, not X-Forwarded-For
    (which can contain client-provided values). If the expected header is
    missing or invalid, fail closed instead of rate-limiting every visitor as
    the same proxy address.

    Outside Render, use the socket peer address for local development/tests.
    """
    if os.getenv("RENDER_SERVICE_ID"):
        candidate = request.headers.get("cf-connecting-ip")
        if not candidate:
            raise _UNAVAILABLE
        try:
            return str(ipaddress.ip_address(candidate.strip()))
        except ValueError:
            raise _UNAVAILABLE from None

    client = request.client
    if client is None or not client.host:
        raise _UNAVAILABLE
    try:
        return str(ipaddress.ip_address(client.host))
    except ValueError:
        raise _UNAVAILABLE from None
