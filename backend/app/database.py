from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
DATABASE_URL = "sqlite:///./portal.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
class Base(DeclarativeBase):
    pass
def add_missing_code_columns():
    with engine.begin() as connection:
        for table_name, column_name in (("companies", "company_code"), ("employees", "employee_code")):
            columns = connection.exec_driver_sql(f"PRAGMA table_info({table_name})").fetchall()
            if not any(column[1] == column_name for column in columns):
                connection.exec_driver_sql(f"ALTER TABLE {table_name} ADD COLUMN {column_name} VARCHAR(50)")
