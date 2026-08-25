from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import engine
from app.dependencies import get_current_user
from app.models import Employee, User, UserRole
from app.schemas import EmployeeResponse, LoginRequest
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
