"""
Migra los datos de SQLite a Neon/PostgreSQL sin modificar el archivo SQLite.
Ejecutar desde la carpeta backend:
    python migrate_sqlite_to_neon.py

Variables necesarias:
    NEON_DATABASE_URL=postgresql+psycopg://...
Dependencia:
    pip install "psycopg[binary]"
"""
import os
from pathlib import Path

from sqlalchemy import create_engine, MetaData, select, text
from sqlalchemy.engine import make_url

SOURCE_DB = Path(__file__).resolve().parent / "portal.db"
TARGET_URL = os.getenv("NEON_DATABASE_URL", "").strip()

TABLE_ORDER = ["companies", "employees", "users", "contracts", "nominas"]

if not SOURCE_DB.is_file():
    raise SystemExit(f"No encuentro la base local: {SOURCE_DB}")
if not TARGET_URL:
    raise SystemExit("Falta la variable NEON_DATABASE_URL.")
if not TARGET_URL.startswith(("postgresql://", "postgres://", "postgresql+psycopg://")):
    raise SystemExit("NEON_DATABASE_URL debe ser una URL PostgreSQL de Neon.")

if TARGET_URL.startswith("postgresql://"):
    TARGET_URL = TARGET_URL.replace("postgresql://", "postgresql+psycopg://", 1)
elif TARGET_URL.startswith("postgres://"):
    TARGET_URL = TARGET_URL.replace("postgres://", "postgresql+psycopg://", 1)

source = create_engine(f"sqlite:///{SOURCE_DB.as_posix()}")
target = create_engine(TARGET_URL)

try:
    source_meta = MetaData()
    source_meta.reflect(bind=source)

    missing = [name for name in TABLE_ORDER if name not in source_meta.tables]
    if missing:
        raise SystemExit("Faltan tablas en SQLite: " + ", ".join(missing))

    target_meta = MetaData()
    target_meta.reflect(bind=target)

    # No sobrescribir una base Neon que ya contenga registros.
    existing_tables = [name for name in TABLE_ORDER if name in target_meta.tables]
    with target.connect() as conn:
        populated = []
        for name in existing_tables:
            count = conn.execute(
                select(text("COUNT(*)")).select_from(target_meta.tables[name])
            ).scalar_one()
            if count:
                populated.append(f"{name} ({count})")
    if populated:
        raise SystemExit(
            "ABORTADO: Neon ya contiene registros en: "
            + ", ".join(populated)
            + ". No se ha escrito nada."
        )

    # La estructura de destino debe haberse creado previamente con los modelos.
    missing_target = [name for name in TABLE_ORDER if name not in target_meta.tables]
    if missing_target:
        raise SystemExit(
            "Faltan tablas en Neon: "
            + ", ".join(missing_target)
            + ". Inicializa el esquema antes de migrar."
        )

    counts = {}
    with source.connect() as src, target.begin() as dst:
        for name in TABLE_ORDER:
            src_table = source_meta.tables[name]
            dst_table = target_meta.tables[name]
            rows = src.execute(select(src_table)).mappings().all()
            if not rows:
                counts[name] = 0
                continue

            destination_columns = {column.name for column in dst_table.columns}
            source_columns = {column.name for column in src_table.columns}
            absent = source_columns - destination_columns
            if absent:
                raise RuntimeError(
                    f"Columnas de {name} que no existen en Neon: {', '.join(sorted(absent))}"
                )

            payload = [
                {key: value for key, value in dict(row).items() if key in destination_columns}
                for row in rows
            ]
            dst.execute(dst_table.insert(), payload)
            counts[name] = len(payload)

        # Ajustar las secuencias de IDs para que las próximas altas no colisionen.
        for name in TABLE_ORDER:
            table = target_meta.tables[name]
            if "id" not in table.c:
                continue
            max_id = dst.execute(
                select(text("MAX(id)")).select_from(table)
            ).scalar_one()
            if max_id is not None:
                dst.execute(
                    text(
                        "SELECT setval(pg_get_serial_sequence(:table_name, 'id'), "
                        ":max_id, true)"
                    ),
                    {"table_name": name, "max_id": max_id},
                )

    print("Migración terminada. Registros copiados:")
    for name in TABLE_ORDER:
        print(f"  {name}: {counts.get(name, 0)}")

finally:
    source.dispose()
    target.dispose()
