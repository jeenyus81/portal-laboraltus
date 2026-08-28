from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import engine
from app.models import (
    Company,
    Contract,
    Employee,
    Nomina,
    User,
    UserRole,
)
from app.security import hash_password


def seed():

    with Session(engine) as session:

        # ====================================================
        # EMPRESA
        # ====================================================

        company = session.scalar(
            select(Company).where(
                Company.tax_id == "B00000000"
            )
        )

        if company is None:

            company = Company(
                name="Empresa de Prueba",
                tax_id="B00000000",
                address="Calle de Prueba 1, Santander",
            )

            session.add(company)
            session.flush()

            print(
                f"Empresa creada con ID: {company.id}"
            )

        else:

            print(
                f"La empresa ya existe con ID: "
                f"{company.id}"
            )

        # ====================================================
        # EMPLEADO
        # ====================================================

        employee = session.scalar(
            select(Employee).where(
                Employee.national_id == "00000000T"
            )
        )

        if employee is None:

            employee = Employee(
                company_id=company.id,
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

            session.add(employee)
            session.flush()

            print(
                f"Empleado creado con ID: "
                f"{employee.id}"
            )

        else:

            print(
                f"El empleado ya existe con ID: "
                f"{employee.id}"
            )

            # Reparar asociación si estaba vacía
            if employee.company_id != company.id:
                employee.company_id = company.id

                print(
                    "Empleado asociado a la empresa"
                )

        # ====================================================
        # CONTRATO
        # ====================================================

        contract = session.scalar(
            select(Contract).where(
                Contract.employee_id == employee.id
            )
        )

        if contract is None:

            contract = Contract(
                employee_id=employee.id,
                start_date=date(2024, 1, 15),
                end_date=None,
                contract_type="Indefinido",
                document_path=None,
            )

            session.add(contract)
            session.flush()

            print(
                f"Contrato creado con ID: "
                f"{contract.id}"
            )

        else:

            print(
                f"El contrato ya existe con ID: "
                f"{contract.id}"
            )

        # ====================================================
        # NOMINA
        # ====================================================

        nomina = session.scalar(
            select(Nomina).where(
                Nomina.employee_id == employee.id,
                Nomina.date == date(2026, 8, 1),
            )
        )

        if nomina is None:

            nomina = Nomina(
                employee_id=employee.id,
                date=date(2026, 8, 1),
                document_path=None,
            )

            session.add(nomina)
            session.flush()

            print(
                f"Nomina creada con ID: "
                f"{nomina.id}"
            )

        else:

            print(
                f"La nomina ya existe con ID: "
                f"{nomina.id}"
            )

        # ====================================================
        # USUARIO EMPLEADO
        # ====================================================

        user = session.scalar(
            select(User).where(
                User.username == "carlos.garcia"
            )
        )

        if user is None:

            user = User(
                username="carlos.garcia",
                password_hash=hash_password(
                    "Prueba123!"
                ),
                role=UserRole.EMPLOYEE,
                employee_id=employee.id,
            )

            session.add(user)

            print(
                "Usuario creado: carlos.garcia"
            )

        else:

            print(
                "El usuario carlos.garcia ya existe"
            )

            if user.employee_id != employee.id:
                user.employee_id = employee.id

        # ====================================================
        # USUARIO HR
        # ====================================================

        hr_user = session.scalar(
            select(User).where(
                User.username == "hr.admin"
            )
        )

        if hr_user is None:

            hr_user = User(
                username="hr.admin",
                password_hash=hash_password(
                    "Prueba123!"
                ),
                role=UserRole.HR,
                employee_id=None,
            )

            session.add(hr_user)

            print(
                "Usuario HR creado: hr.admin"
            )

        else:

            print(
                "El usuario HR hr.admin ya existe"
            )

        # ====================================================
        # GUARDAR
        # ====================================================

        session.commit()

        print("")
        print("==============================")
        print("SEED COMPLETADO")
        print("==============================")
        print(
            f"Empresa: {company.name} "
            f"(ID {company.id})"
        )
        print(
            f"Empleado: {employee.first_name} "
            f"{employee.last_name} "
            f"(ID {employee.id})"
        )
        print(
            "HR: hr.admin / Prueba123!"
        )
        print(
            "Empleado: carlos.garcia / Prueba123!"
        )


if __name__ == "__main__":
    seed()