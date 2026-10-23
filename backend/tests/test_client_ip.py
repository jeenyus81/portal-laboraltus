import os
import unittest
from unittest.mock import patch

from fastapi import HTTPException
from starlette.requests import Request

from app.client_ip import get_client_ip


def make_request(client_host="192.0.2.50", headers=()):
    return Request({
        "type": "http",
        "method": "POST",
        "path": "/api/auth/login",
        "headers": [(name.lower().encode(), value.encode()) for name, value in headers],
        "client": (client_host, 12345),
        "server": ("testserver", 80),
        "scheme": "http",
        "query_string": b"",
        "http_version": "1.1",
        "root_path": "",
        "app": None,
    })


class ClientIPTests(unittest.TestCase):
    def test_local_uses_socket_peer_not_forwarded_header(self):
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("RENDER_SERVICE_ID", None)
            request = make_request(headers=[("x-forwarded-for", "203.0.113.77")])
            self.assertEqual(get_client_ip(request), "192.0.2.50")

    def test_render_uses_validated_cf_connecting_ip(self):
        with patch.dict(os.environ, {"RENDER_SERVICE_ID": "srv-test"}):
            request = make_request(headers=[("cf-connecting-ip", "203.0.113.77")])
            self.assertEqual(get_client_ip(request), "203.0.113.77")

    def test_render_missing_header_fails_closed(self):
        with patch.dict(os.environ, {"RENDER_SERVICE_ID": "srv-test"}):
            with self.assertRaises(HTTPException) as ctx:
                get_client_ip(make_request())
            self.assertEqual(ctx.exception.status_code, 503)

    def test_render_invalid_header_fails_closed(self):
        with patch.dict(os.environ, {"RENDER_SERVICE_ID": "srv-test"}):
            request = make_request(headers=[("cf-connecting-ip", "203.0.113.1, 198.51.100.2")])
            with self.assertRaises(HTTPException) as ctx:
                get_client_ip(request)
            self.assertEqual(ctx.exception.status_code, 503)


if __name__ == "__main__":
    unittest.main(verbosity=2)
