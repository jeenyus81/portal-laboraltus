from collections import deque
from dataclasses import dataclass, field
from threading import Lock
from time import time


MAX_FAILED_ATTEMPTS = 5
WINDOW_SECONDS = 15 * 60
BLOCK_SECONDS = 15 * 60


@dataclass
class AttemptRecord:
    failures: deque = field(default_factory=deque)
    blocked_until: float = 0.0


class InMemoryLoginRateLimiter:
    """Limitador temporal para pruebas locales; no usar en producción."""

    def __init__(
        self,
        max_attempts=MAX_FAILED_ATTEMPTS,
        window_seconds=WINDOW_SECONDS,
        block_seconds=BLOCK_SECONDS,
        clock=time,
    ):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.block_seconds = block_seconds
        self.clock = clock
        self.records = {}
        self.lock = Lock()

    def is_blocked(self, key: str) -> bool:
        now = self.clock()
        with self.lock:
            record = self.records.get(key)
            if record is None:
                return False
            if record.blocked_until > now:
                return True
            if record.blocked_until:
                record.blocked_until = 0.0
                record.failures.clear()
            self._prune(record, now)
            return False

    def record_failure(self, key: str) -> bool:
        now = self.clock()
        with self.lock:
            record = self.records.setdefault(key, AttemptRecord())
            if record.blocked_until > now:
                return True
            if record.blocked_until:
                record.blocked_until = 0.0
                record.failures.clear()
            self._prune(record, now)
            record.failures.append(now)
            if len(record.failures) >= self.max_attempts:
                record.blocked_until = now + self.block_seconds
                return True
            return False

    def record_success(self, key: str) -> None:
        with self.lock:
            self.records.pop(key, None)

    def _prune(self, record: AttemptRecord, now: float) -> None:
        cutoff = now - self.window_seconds
        while record.failures and record.failures[0] <= cutoff:
            record.failures.popleft()
