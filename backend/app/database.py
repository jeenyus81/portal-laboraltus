
import os

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Detectar si la aplicación se está ejecutando en Render.
IS_RENDER = bool(os.getenv("RENDER_SERVICE_ID"))

DATABASE_URL = os.getenv("DATABASE_URL")

# En Render, exigir PostgreSQL. En local, conservar SQLite por defecto.
if IS_RENDER:
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL no está configurada en Render."
        )
    if DATABASE_URL.startswith("sqlite"):
        raise RuntimeError(
            "Render no puede utilizar SQLite. Configura DATABASE_URL "
            "con la URL de PostgreSQL de Neon."
        )
else:
    DATABASE_URL = DATABASE_URL or "sqlite:///./portal.db"

# Usar psycopg 3 para PostgreSQL.
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://", "postgresql+psycopg://", 1
    )
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://", "postgresql+psycopg://", 1
    )

connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


def add_missing_code_columns():
    with engine.begin() as connection:
        inspector = inspect(connection)
        tables = set(inspector.get_table_names())

        for table_name, column_name in (
            ("companies", "company_code"),
            ("employees", "employee_code"),
        ):
            if table_name not in tables:
                continue

            columns = {
                column["name"]
                for column in inspect(connection).get_columns(table_name)
            }

            if column_name not in columns:
                connection.execute(
                    text(
                        f"ALTER TABLE {table_name} "
                        f"ADD COLUMN {column_name} VARCHAR(50)"
                    )
                )