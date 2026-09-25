from sqlalchemy import text

from app.database import Base, engine
from app.models import (
    Company,
    User,
    Employee,
    Contract,
    Nomina,
)


def init_db():
    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
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