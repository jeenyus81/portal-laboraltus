from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import engine
from app.dependencies import get_current_user, require_hr
from app.models import Contract, Employee, User, UserRole
from app.schemas import (
    ContractCreate,
    ContractResponse,
    EmployeeCreate,
    EmployeeResponse,
    LoginRequest,
)
from app.security import create_access_token, verify_password


app = FastAPI()


@app.get("/api/hello")
def hello():
    return {"message": "Hola desde Proyecto Learning"}


@app.post("/api/auth/login")
def login(data: LoginRequest):
    with Session(engine) as session:
        user = session.scalar(
            select(User).where(User.username == data.username)
        )

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password",
            )

        if not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password",
            )

        token = create_access_token(user.id, user.role)

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": user.role,
        }


@app.get("/api/me")
def get_me(current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        employee = session.get(Employee, current_user.employee_id)

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        return {
            "id": employee.id,
            "first_name": employee.first_name,
            "last_name": employee.last_name,
            "national_id": employee.national_id,
            "nationality": employee.nationality,
            "gender": employee.gender,
            "birth_date": employee.birth_date,
            "address": employee.address,
            "job_category": employee.job_category,
            "job_title": employee.job_title,
            "seniority_date": employee.seniority_date,
            "social_security_number": employee.social_security_number,
        }

@app.get("/api/employees", response_model=list[EmployeeResponse])
def list_employees(
    current_user: User = Depends(require_hr),
):
    with Session(engine) as session:
        return session.scalars(
            select(Employee).order_by(Employee.id)
        ).all()


@app.post("/api/employees", response_model=EmployeeResponse, status_code=201)
def create_employee(
    data: EmployeeCreate,
    current_user: User = Depends(require_hr),
):
    with Session(engine) as session:
        employee = Employee(**data.model_dump())

        session.add(employee)

        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(
                status_code=409,
                detail="An employee with this national ID or social security number already exists",
            )

        session.refresh(employee)

        return employee

@app.get(
    "/api/employees/{employee_id}/contracts",
    response_model=list[ContractResponse],
)
def list_employee_contracts(
    employee_id: int,
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.EMPLOYEE:
        if current_user.employee_id != employee_id:
            raise HTTPException(
                status_code=403,
                detail="You can only access your own contracts",
            )

    with Session(engine) as session:
        employee = session.get(Employee, employee_id)

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        return employee.contracts


@app.post(
    "/api/employees/{employee_id}/contracts",
    response_model=ContractResponse,
    status_code=201,
)
def create_contract(
    employee_id: int,
    data: ContractCreate,
    current_user: User = Depends(require_hr),
):
    with Session(engine) as session:
        employee = session.get(Employee, employee_id)

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        contract = Contract(
            employee_id=employee_id,
            **data.model_dump(),
        )

        session.add(contract)
        session.commit()
        session.refresh(contract)

        return contract

@app.get("/api/employees/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.EMPLOYEE:
        if current_user.employee_id != employee_id:
            raise HTTPException(
                status_code=403,
                detail="You can only access your own employee profile",
            )

    with Session(engine) as session:
        employee = session.get(Employee, employee_id)

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        return employee
