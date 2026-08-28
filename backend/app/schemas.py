from datetime import date

from pydantic import BaseModel, ConfigDict


# ============================================================
# LOGIN
# ============================================================


class LoginRequest(BaseModel):
    username: str
    password: str


# ============================================================
# EMPRESAS
# ============================================================


class CompanyCreate(BaseModel):
    name: str
    tax_id: str
    address: str


class CompanyResponse(BaseModel):
    id: int
    name: str
    tax_id: str
    address: str

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# EMPLEADOS
# ============================================================


class EmployeeCreate(BaseModel):
    company_id: int

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

    username: str
    password: str

class EmployeeUpdate(BaseModel):
    company_id: int

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

    username: str


class EmployeeResponse(BaseModel):
    id: int

    company_id: int | None

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

    username: str | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# CONTRATOS
# ============================================================


class ContractCreate(BaseModel):
    start_date: date
    end_date: date | None = None
    contract_type: str
    document_path: str | None = None


class ContractResponse(BaseModel):
    id: int
    employee_id: int

    start_date: date
    end_date: date | None

    contract_type: str
    document_path: str | None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# NOMINAS
# ============================================================


class NominaCreate(BaseModel):
    date: date
    document_path: str | None = None


class NominaResponse(BaseModel):
    id: int
    employee_id: int

    date: date

    document_path: str | None

    model_config = ConfigDict(
        from_attributes=True
    )