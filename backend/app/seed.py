from datetime import date

from sqlalchemy.orm import Session

from app.database import engine
from app.models import Contract, Employee


def seed():
    with Session(engine) as session:
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
        session.commit()

        print(f"Empleado creado con ID: {employee.id}")
        print(f"Contrato creado con ID: {contract.id}")


if __name__ == "__main__":
    seed()
