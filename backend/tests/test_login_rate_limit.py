import unittest

from app.login_rate_limit import InMemoryLoginRateLimiter


class FakeClock:
    def __init__(self):
        self.now = 1000.0

    def __call__(self):
        return self.now

    def advance(self, seconds):
        self.now += seconds


class LoginRateLimiterTests(unittest.TestCase):
    def setUp(self):
        self.clock = FakeClock()
        self.limiter = InMemoryLoginRateLimiter(clock=self.clock)

    def test_blocks_on_fifth_failed_attempt(self):
        for _ in range(4):
            self.assertFalse(self.limiter.record_failure("ip-a"))
        self.assertTrue(self.limiter.record_failure("ip-a"))
        self.assertTrue(self.limiter.is_blocked("ip-a"))

    def test_block_expires_after_fifteen_minutes(self):
        for _ in range(5):
            self.limiter.record_failure("ip-a")
        self.clock.advance(15 * 60 + 1)
        self.assertFalse(self.limiter.is_blocked("ip-a"))

    def test_attempts_outside_window_are_removed(self):
        for _ in range(4):
            self.limiter.record_failure("ip-a")
        self.clock.advance(15 * 60 + 1)
        self.assertFalse(self.limiter.record_failure("ip-a"))

    def test_success_clears_attempts(self):
        for _ in range(4):
            self.limiter.record_failure("ip-a")
        self.limiter.record_success("ip-a")
        for _ in range(4):
            self.assertFalse(self.limiter.record_failure("ip-a"))

    def test_keys_are_independent(self):
        for _ in range(5):
            self.limiter.record_failure("ip-a")
        self.assertTrue(self.limiter.is_blocked("ip-a"))
        self.assertFalse(self.limiter.is_blocked("ip-b"))


if __name__ == "__main__":
    unittest.main()
