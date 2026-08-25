from datetime import date

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class EmployeeResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    national_id: str
    nationality: str
    gender: str
    birth_date: date
    address: str
    job_category: str
    job_title: str
    seniority_date: date
    social_security_number: str

    model_config = {
        "from_attributes": True
    }