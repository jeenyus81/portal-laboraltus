from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class UserRole:
    EMPLOYEE = "EMPLOYEE"
    HR = "HR"


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False,
    )

    tax_id: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        nullable=False,
    )

    address: Mapped[str] = mapped_column(
        String(250),
        nullable=False,
    )

    employees: Mapped[list["Employee"]] = relationship(
        back_populates="company"
    )


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)

    company_id: Mapped[int | None] = mapped_column(
        ForeignKey("companies.id"),
        nullable=True,
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    national_id: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
    )

    nationality: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    gender: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    birth_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    address: Mapped[str] = mapped_column(
        String(250),
        nullable=False,
    )

    job_category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    job_title: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    seniority_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    social_security_number: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        nullable=False,
    )

    company: Mapped["Company | None"] = relationship(
        back_populates="employees"
    )

    contracts: Mapped[list["Contract"]] = relationship(
        back_populates="employee",
        cascade="all, delete-orphan",
    )

    nominas: Mapped[list["Nomina"]] = relationship(
        back_populates="employee",
        cascade="all, delete-orphan",
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
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

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
        ForeignKey("employees.id"),
        nullable=False,
    )

    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    contract_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    document_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    employee: Mapped["Employee"] = relationship(
        back_populates="contracts"
    )


class Nomina(Base):
    __tablename__ = "nominas"

    id: Mapped[int] = mapped_column(primary_key=True)

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"),
        nullable=False,
    )

    date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    document_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    employee: Mapped["Employee"] = relationship(
        back_populates="nominas"
    )