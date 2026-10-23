import os
import unittest
from datetime import datetime, timedelta, timezone

os.environ.setdefault(
    "SECRET_KEY",
    "isolated-jwt-test-secret-not-for-production-32bytes-min",
)

import jwt
from app import security


class SecurityJWTTests(unittest.TestCase):
    def test_created_token_contains_required_claims(self):
        token = security.create_access_token(123, "EMPLOYEE")
        payload = security.decode_access_token(token)

        self.assertEqual(payload["sub"], "123")
        self.assertEqual(payload["role"], "EMPLOYEE")
        self.assertIn("iat", payload)
        self.assertIn("exp", payload)

    def test_created_token_expires_after_configured_duration(self):
        token = security.create_access_token(123, "EMPLOYEE")
        payload = jwt.decode(
            token,
            security.SECRET_KEY,
            algorithms=[security.ALGORITHM],
        )

        lifetime = payload["exp"] - payload["iat"]
        self.assertEqual(
            lifetime,
            security.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    def test_expired_token_is_rejected(self):
        now = datetime.now(timezone.utc)
        token = jwt.encode(
            {
                "sub": "123",
                "role": "EMPLOYEE",
                "iat": now - timedelta(hours=2),
                "exp": now - timedelta(hours=1),
            },
            security.SECRET_KEY,
            algorithm=security.ALGORITHM,
        )

        with self.assertRaises(jwt.ExpiredSignatureError):
            security.decode_access_token(token)

    def test_token_missing_required_claim_is_rejected(self):
        token = jwt.encode(
            {"sub": "123", "role": "EMPLOYEE"},
            security.SECRET_KEY,
            algorithm=security.ALGORITHM,
        )

        with self.assertRaises(jwt.MissingRequiredClaimError):
            security.decode_access_token(token)


if __name__ == "__main__":
    unittest.main(verbosity=2)
