from datetime import date

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class EmployeeCreate(BaseModel):
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


class ContractResponse(BaseModel):
    id: int
    employee_id: int
    start_date: date
    end_date: date | None
    contract_type: str
    document_path: str | None

    model_config = {
        "from_attributes": True
    }


class ContractCreate(BaseModel):
    start_date: date
    end_date: date | None = None
    contract_type: str
    document_path: str | None = None


class NominaResponse(BaseModel):
    id: int
    employee_id: int
    date: date
    document_path: str | None

    model_config = {
        "from_attributes": True
    }