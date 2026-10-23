import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from starlette.requests import Request

os.environ.setdefault("SECRET_KEY", "isolated-endpoint-test-secret-at-least-32-bytes")

import app.main as main
from app.database import Base
from app.login_rate_limit_db import ensure_table
from app.models import User
from app.schemas import LoginRequest


class LoginEndpointIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "login_test.db"
        self.engine = create_engine(
            f"sqlite:///{db_path.as_posix()}",
            connect_args={"check_same_thread": False},
        )
        Base.metadata.create_all(bind=self.engine)
        ensure_table(self.engine)

        with Session(self.engine) as session:
            session.add(User(
                username="test-user",
                password_hash="fake-hash",
                role="EMPLOYEE",
            ))
            session.commit()

        self.engine_patch = patch.object(main, "engine", self.engine)
        self.engine_patch.start()

        self.request = Request({
            "type": "http",
            "method": "POST",
            "path": "/api/auth/login",
            "headers": [],
            "client": ("192.0.2.50", 12345),
            "server": ("testserver", 80),
            "scheme": "http",
            "query_string": b"",
            "http_version": "1.1",
            "root_path": "",
            "app": main.app,
        })

    def tearDown(self):
        self.engine_patch.stop()
        self.engine.dispose()
        self.temp_dir.cleanup()

    def login(self, password="wrong"):
        return main.login(
            LoginRequest(username="test-user", password=password),
            self.request,
        )

    def test_wrong_password_returns_401(self):
        with patch.object(main, "verify_password", return_value=False):
            with self.assertRaises(HTTPException) as ctx:
                self.login()
        self.assertEqual(ctx.exception.status_code, 401)

    def test_fifth_failure_returns_429(self):
        with patch.object(main, "verify_password", return_value=False):
            for attempt in range(4):
                with self.assertRaises(HTTPException) as ctx:
                    self.login()
                self.assertEqual(ctx.exception.status_code, 401)

            with self.assertRaises(HTTPException) as ctx:
                self.login()

        self.assertEqual(ctx.exception.status_code, 429)
        self.assertEqual(ctx.exception.headers["Retry-After"], "900")

    def test_success_returns_token(self):
        with patch.object(main, "verify_password", return_value=True), \
             patch.object(main, "create_access_token", return_value="test-token"):
            result = self.login(password="correct")

        self.assertEqual(result["access_token"], "test-token")
        self.assertEqual(result["token_type"], "bearer")

    def test_blocked_ip_stays_blocked(self):
        with patch.object(main, "verify_password", return_value=False):
            for _ in range(5):
                try:
                    self.login()
                except HTTPException:
                    pass

        with patch.object(main, "verify_password", return_value=True):
            with self.assertRaises(HTTPException) as ctx:
                self.login(password="correct")

        self.assertEqual(ctx.exception.status_code, 429)


if __name__ == "__main__":
    unittest.main(verbosity=2)
