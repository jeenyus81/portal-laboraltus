import os
import unittest
from unittest.mock import patch

from fastapi import HTTPException
from sqlalchemy.exc import OperationalError
from starlette.requests import Request

os.environ.setdefault("SECRET_KEY", "isolated-db-error-test-secret-at-least-32-bytes")

import app.main as main
from app.schemas import LoginRequest


class LoginDatabaseErrorTests(unittest.TestCase):
    def setUp(self):
        self.request = Request({
            "type": "http",
            "method": "POST",
            "path": "/api/auth/login",
            "headers": [],
            "client": ("192.0.2.77", 12345),
            "server": ("testserver", 80),
            "scheme": "http",
            "query_string": b"",
            "http_version": "1.1",
            "root_path": "",
            "app": main.app,
        })

    def test_database_failure_returns_503(self):
        with patch.object(main, "engine") as engine_mock:
            engine_mock.dialect.name = "sqlite"

            with patch(
                "app.login_rate_limit_db.PersistentLoginRateLimiter.is_blocked",
                side_effect=OperationalError("SELECT 1", {}, Exception("offline")),
            ):
                with self.assertRaises(HTTPException) as ctx:
                    main.login(
                        LoginRequest(
                            username="test-user",
                            password="test-password",
                        ),
                        self.request,
                    )

        self.assertEqual(ctx.exception.status_code, 503)
        self.assertEqual(
            ctx.exception.detail,
            "Authentication temporarily unavailable",
        )

    def test_limiter_initialization_failure_returns_503(self):
        with patch.object(main, "engine") as engine_mock:
            with patch(
                "app.login_rate_limit_db.PersistentLoginRateLimiter",
                side_effect=RuntimeError("simulated initialization failure"),
                create=True,
            ):
                with self.assertRaises(HTTPException) as ctx:
                    main.login(
                        LoginRequest(
                            username="test-user",
                            password="test-password",
                        ),
                        self.request,
                    )

        self.assertEqual(ctx.exception.status_code, 503)
        self.assertEqual(
            ctx.exception.detail,
            "Authentication temporarily unavailable",
        )

if __name__ == "__main__":
    unittest.main(verbosity=2)
