from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import engine
from app.models import Contract, Employee, User, UserRole
from app.security import hash_password


def seed():
    with Session(engine) as session:
        employee = session.scalar(
            select(Employee).where(Employee.national_id == "00000000T")
        )

        if employee is None:
            employee = Employee(
                first_name="Carlos",
                last_name="Garcia Lopez",
                national_id="00000000T",
                nationality="Espanola",
                gender="M",
                birth_date=date(1990, 5, 15),
                address="Calle de Prueba 1, Santander",
                job_category="Tecnico",
                job_title="Tecnico de Sistemas",
                seniority_date=date(2024, 1, 15),
                social_security_number="000000000000",
            )

            contract = Contract(
                start_date=date(2024, 1, 15),
                end_date=None,
                contract_type="Indefinido",
                document_path=None,
            )

            employee.contracts.append(contract)

            session.add(employee)
            session.flush()

            print(f"Empleado creado con ID: {employee.id}")
            print(f"Contrato creado con ID: {contract.id}")
        else:
            print(f"El empleado ya existe con ID: {employee.id}")

        user = session.scalar(
            select(User).where(User.username == "carlos.garcia")
        )

        if user is None:
            user = User(
                username="carlos.garcia",
                password_hash=hash_password("Prueba123!"),
                role=UserRole.EMPLOYEE,
                employee_id=employee.id,
            )

            session.add(user)
            print("Usuario creado: carlos.garcia")
        else:
            print("El usuario carlos.garcia ya existe")
        hr_user = session.scalar(
            select(User).where(User.username == "hr.admin")
        )

        if hr_user is None:
            hr_user = User(
                username="hr.admin",
                password_hash=hash_password("Prueba123!"),
                role=UserRole.HR,
                employee_id=None,
            )

            session.add(hr_user)
            print("Usuario HR creado: hr.admin")
        else:
            print("El usuario HR hr.admin ya existe")
        session.commit()


if __name__ == "__main__":
    seed()