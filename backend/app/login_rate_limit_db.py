import hashlib
import hmac
import os
import time

from sqlalchemy import (
    Column, Float, Integer, MetaData, String, Table, case, select, delete
)
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert


MAX_FAILED_ATTEMPTS = 5
WINDOW_SECONDS = 15 * 60
BLOCK_SECONDS = 15 * 60

metadata = MetaData()

login_attempts = Table(
    "login_rate_limits",
    metadata,
    Column("ip_hash", String(64), primary_key=True),
    Column("window_started_at", Float, nullable=False),
    Column("failed_attempts", Integer, nullable=False),
    Column("blocked_until", Float, nullable=True),
)


def _ip_hash(ip: str) -> str:
    secret = os.getenv("SECRET_KEY")
    if not secret:
        raise RuntimeError("SECRET_KEY es necesaria para identificar IPs.")
    return hmac.new(
        secret.encode("utf-8"),
        ip.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def ensure_table(engine) -> None:
    """Crear únicamente la tabla del limitador en el motor indicado."""
    metadata.create_all(bind=engine, tables=[login_attempts])


class PersistentLoginRateLimiter:
    def __init__(self, engine, clock=time.time):
        self.engine = engine
        self.clock = clock
        if engine.dialect.name == "postgresql":
            self.insert = pg_insert
        elif engine.dialect.name == "sqlite":
            self.insert = sqlite_insert
        else:
            raise RuntimeError("Motor no compatible con el limitador.")

    def is_blocked(self, ip: str) -> bool:
        now = self.clock()
        key = _ip_hash(ip)
        with self.engine.connect() as conn:
            row = conn.execute(
                select(login_attempts.c.blocked_until).where(
                    login_attempts.c.ip_hash == key
                )
            ).first()
        return bool(row and row[0] is not None and row[0] > now)

    def record_failure(self, ip: str) -> bool:
        now = self.clock()
        cutoff = now - WINDOW_SECONDS
        key = _ip_hash(ip)
        ins = self.insert(login_attempts).values(
            ip_hash=key,
            window_started_at=now,
            failed_attempts=1,
            blocked_until=None,
        )
        current = login_attempts
        expired_window = current.c.window_started_at <= cutoff
        already_blocked = current.c.blocked_until > now
        next_count = current.c.failed_attempts + 1

        stmt = ins.on_conflict_do_update(
            index_elements=[current.c.ip_hash],
            set_={
                "window_started_at": case(
                    (already_blocked, current.c.window_started_at),
                    (expired_window, now),
                    else_=current.c.window_started_at,
                ),
                "failed_attempts": case(
                    (already_blocked, current.c.failed_attempts),
                    (expired_window, 1),
                    else_=next_count,
                ),
                "blocked_until": case(
                    (already_blocked, current.c.blocked_until),
                    (expired_window, None),
                    (next_count >= MAX_FAILED_ATTEMPTS, now + BLOCK_SECONDS),
                    else_=None,
                ),
            },
        )

        with self.engine.begin() as conn:
            conn.execute(stmt)
            blocked_until = conn.execute(
                select(current.c.blocked_until).where(
                    current.c.ip_hash == key
                )
            ).scalar_one()

        return blocked_until is not None and blocked_until > now

    def record_success(self, ip: str) -> None:
        key = _ip_hash(ip)
        now = self.clock()
        with self.engine.begin() as conn:
            conn.execute(
                delete(login_attempts).where(
                    login_attempts.c.ip_hash == key,
                    (login_attempts.c.blocked_until.is_(None))
                    | (login_attempts.c.blocked_until <= now),
                )
            )
