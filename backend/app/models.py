from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base
class UserRole:
    EMPLOYEE = "EMPLOYEE"
    HR = "HR"

class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)

    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(150))

    national_id: Mapped[str] = mapped_column(String(20), unique=True)
    nationality: Mapped[str] = mapped_column(String(50))
    gender: Mapped[str] = mapped_column(String(30))

    birth_date: Mapped[date] = mapped_column(Date)
    address: Mapped[str] = mapped_column(String(250))

    job_category: Mapped[str] = mapped_column(String(100))
    job_title: Mapped[str] = mapped_column(String(100))

    seniority_date: Mapped[date] = mapped_column(Date)

    social_security_number: Mapped[str] = mapped_column(
        String(30),
        unique=True,
    )

    contracts: Mapped[list["Contract"]] = relationship(
        back_populates="employee"
    )

    user: Mapped["User | None"] = relationship(
        back_populates="employee",
        uselist=False,
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
    )

    password_hash: Mapped[str] = mapped_column(String(255))

    role: Mapped[str] = mapped_column(String(20))

    employee_id: Mapped[int | None] = mapped_column(
        ForeignKey("employees.id"),
        unique=True,
        nullable=True,
    )

    employee: Mapped["Employee | None"] = relationship(
        back_populates="user"
    )


class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[int] = mapped_column(primary_key=True)

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id")
    )

    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    contract_type: Mapped[str] = mapped_column(String(100))

    document_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    employee: Mapped["Employee"] = relationship(
        back_populates="contracts"
    )
