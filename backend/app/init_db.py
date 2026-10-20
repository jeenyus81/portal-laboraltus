from sqlalchemy import text

from app.database import Base, engine
from app.models import (
    Company,
    User,
    Employee,
    Contract,
    Nomina,
)


def add_original_filename_columns(conn):
    if engine.dialect.name == "postgresql":
        conn.execute(
            text(
                "ALTER TABLE contracts "
                "ADD COLUMN IF NOT EXISTS original_filename VARCHAR(500)"
            )
        )
        conn.execute(
            text(
                "ALTER TABLE nominas "
                "ADD COLUMN IF NOT EXISTS original_filename VARCHAR(500)"
            )
        )
    elif engine.dialect.name == "sqlite":
        for table in ("contracts", "nominas"):
            columns = {
                row[1]
                for row in conn.execute(
                    text(f"PRAGMA table_info({table})")
                ).all()
            }
            if "original_filename" not in columns:
                conn.execute(
                    text(
                        f"ALTER TABLE {table} "
                        "ADD COLUMN original_filename VARCHAR(500)"
                    )
                )


def init_db():
    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        add_original_filename_columns(conn)
        if engine.dialect.name == "postgresql":
            db_info = conn.execute(
                text(
                    "SELECT current_database(), "
                    "current_schema(), inet_server_addr()"
                )
            ).one()

            user_exists = conn.execute(
                text(
                    "SELECT EXISTS ("
                    "SELECT 1 FROM users "
                    "WHERE username = :username)"
                ),
                {"username": "hr.admin"},
            ).scalar()

            print(
                f"DB_DIAG database={db_info[0]} "
                f"schema={db_info[1]} "
                f"server={db_info[2]} "
                f"hr_admin_exists={user_exists}",
                flush=True,
            )
        else:
            print(
                f"DB_DIAG dialect={engine.dialect.name}",
                flush=True,
            )


if __name__ == "__main__":
    init_db()
    print("Base de datos inicializada correctamente")