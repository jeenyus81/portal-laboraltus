import os
import unittest

from sqlalchemy import create_engine, select

from app.login_rate_limit_db import (
    PersistentLoginRateLimiter,
    ensure_table,
    login_attempts,
)


class FakeClock:
    def __init__(self):
        self.now = 1000.0

    def __call__(self):
        return self.now

    def advance(self, seconds):
        self.now += seconds


class PersistentLimiterTests(unittest.TestCase):
    def setUp(self):
        os.environ["SECRET_KEY"] = "local-test-secret-not-for-production"
        self.clock = FakeClock()
        import tempfile
        from pathlib import Path

        self._temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self._temp_dir.name) / "rate_limit_test.db"
        self.engine = create_engine(
            f"sqlite:///{db_path.as_posix()}",
            connect_args={"check_same_thread": False},
        )
        ensure_table(self.engine)
        self.limiter = PersistentLoginRateLimiter(self.engine, self.clock)

    def tearDown(self):
        self.engine.dispose()
        self._temp_dir.cleanup()

    def test_fifth_failure_blocks(self):
        for _ in range(4):
            self.assertFalse(self.limiter.record_failure("192.0.2.10"))
        self.assertTrue(self.limiter.record_failure("192.0.2.10"))
        self.assertTrue(self.limiter.is_blocked("192.0.2.10"))

    def test_block_expires(self):
        for _ in range(5):
            self.limiter.record_failure("192.0.2.11")
        self.clock.advance(15 * 60 + 1)
        self.assertFalse(self.limiter.is_blocked("192.0.2.11"))
        self.assertFalse(self.limiter.record_failure("192.0.2.11"))

    def test_success_clears_attempts(self):
        for _ in range(4):
            self.limiter.record_failure("192.0.2.12")
        self.limiter.record_success("192.0.2.12")
        for _ in range(4):
            self.assertFalse(self.limiter.record_failure("192.0.2.12"))

    def test_ips_are_independent(self):
        for _ in range(5):
            self.limiter.record_failure("192.0.2.13")
        self.assertTrue(self.limiter.is_blocked("192.0.2.13"))
        self.assertFalse(self.limiter.is_blocked("192.0.2.14"))

    def test_database_stores_hash_not_raw_ip(self):
        ip = "192.0.2.15"
        self.limiter.record_failure(ip)
        with self.engine.connect() as conn:
            stored = conn.execute(
                select(login_attempts.c.ip_hash)
            ).scalar_one()
        self.assertNotEqual(stored, ip)
        self.assertEqual(len(stored), 64)

    def test_success_does_not_clear_active_block(self):
        ip = "192.0.2.16"
        for _ in range(5):
            self.limiter.record_failure(ip)
        self.assertTrue(self.limiter.is_blocked(ip))
        self.limiter.record_success(ip)
        self.assertTrue(self.limiter.is_blocked(ip))

    def test_success_clears_unblocked_attempts(self):
        ip = "192.0.2.17"
        for _ in range(4):
            self.limiter.record_failure(ip)
        self.limiter.record_success(ip)
        self.assertFalse(self.limiter.is_blocked(ip))
        self.assertFalse(self.limiter.record_failure(ip))
    def test_separate_limiter_instances_share_database_state(self):
        ip = "192.0.2.18"
        second_limiter = PersistentLoginRateLimiter(self.engine, self.clock)

        for _ in range(5):
            self.limiter.record_failure(ip)

        self.assertTrue(second_limiter.is_blocked(ip))

    def test_concurrent_failures_reach_block(self):
        from concurrent.futures import ThreadPoolExecutor

        ip = "192.0.2.19"

        # Cada llamada utiliza el mismo motor SQLite y realiza un UPSERT atómico.
        with ThreadPoolExecutor(max_workers=5) as pool:
            results = list(pool.map(
                self.limiter.record_failure,
                [ip] * 5,
            ))

        self.assertTrue(self.limiter.is_blocked(ip))
        self.assertEqual(len(results), 5)

        with self.engine.connect() as conn:
            row = conn.execute(
                select(
                    login_attempts.c.failed_attempts,
                    login_attempts.c.blocked_until,
                ).where(login_attempts.c.ip_hash.is_not(None))
            ).all()

        matching = [
            item for item in row
            if item.blocked_until is not None
            and item.blocked_until > self.clock()
        ]
        self.assertTrue(matching)

if __name__ == "__main__":
    unittest.main()
