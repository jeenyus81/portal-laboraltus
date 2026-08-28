from pathlib import Path

from fastapi import (
    Depends,
    FastAPI,
    File,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import Base, engine
from app.dependencies import get_current_user, require_hr
from app.models import (
    Company,
    Contract,
    Employee,
    Nomina,
    User,
    UserRole,
)
from app.schemas import (
    CompanyCreate,
    CompanyResponse,
    ContractCreate,
    ContractResponse,
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
    LoginRequest,
    NominaResponse,
)
from app.security import create_access_token, verify_password


# ============================================================
# APLICACION
# ============================================================

app = FastAPI()


# ============================================================
# CREAR TABLAS
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HELLO
# ============================================================

@app.get("/api/hello")
def hello():
    return {
        "message": "Hola desde Proyecto Learning"
    }


# ============================================================
# LOGIN
# ============================================================

@app.post("/api/auth/login")
def login(data: LoginRequest):

    with Session(engine) as session:

        user = session.scalar(
            select(User).where(
                User.username == data.username
            )
        )

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password",
            )

        if not verify_password(
            data.password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password",
            )

        token = create_access_token(
            user.id,
            user.role,
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": user.role,
        }


# ============================================================
# PERFIL DEL EMPLEADO LOGUEADO
# ============================================================

@app.get("/api/me")
def get_me(
    current_user: User = Depends(get_current_user),
):

    with Session(engine) as session:

        employee = session.get(
            Employee,
            current_user.employee_id,
        )

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
            "social_security_number":
                employee.social_security_number,
        }


# ============================================================
# EMPRESAS
# ============================================================

@app.get(
    "/api/companies",
    response_model=list[CompanyResponse],
)
def list_companies(
    current_user: User = Depends(require_hr),
):

    with Session(engine) as session:

        return session.scalars(
            select(Company).order_by(Company.id)
        ).all()


@app.post(
    "/api/companies",
    response_model=CompanyResponse,
    status_code=201,
)
def create_company(
    data: CompanyCreate,
    current_user: User = Depends(require_hr),
):

    with Session(engine) as session:

        company = Company(
            **data.model_dump()
        )

        session.add(company)

        try:
            session.commit()

        except IntegrityError:
            session.rollback()

            raise HTTPException(
                status_code=409,
                detail=(
                    "A company with this name "
                    "or tax ID already exists"
                ),
            )

        session.refresh(company)

        return company


@app.put(
    "/api/companies/{company_id}",
    response_model=CompanyResponse,
)
def update_company(
    company_id: int,
    data: CompanyCreate,
    current_user: User = Depends(require_hr),
):

    with Session(engine) as session:

        company = session.get(
            Company,
            company_id,
        )

        if company is None:
            raise HTTPException(
                status_code=404,
                detail="Company not found",
            )

        company.name = data.name
        company.tax_id = data.tax_id
        company.address = data.address

        try:
            session.commit()

        except IntegrityError:
            session.rollback()

            raise HTTPException(
                status_code=409,
                detail=(
                    "A company with this name "
                    "or tax ID already exists"
                ),
            )

        session.refresh(company)

        return company


# ============================================================
# EMPLEADOS
# ============================================================

@app.get(
    "/api/employees",
    response_model=list[EmployeeResponse],
)
def list_employees(
    current_user: User = Depends(require_hr),
):

    with Session(engine) as session:

        employees = session.scalars(
            select(Employee)
            .order_by(Employee.id)
        ).all()

        result = []

        for employee in employees:

            username = None

            if employee.user is not None:
                username = employee.user.username

            result.append(
                {
                    "id": employee.id,
                    "company_id": employee.company_id,
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
                    "social_security_number":
                        employee.social_security_number,
                    "username": username,
                }
            )

        return result


@app.post(
    "/api/employees",
    response_model=EmployeeResponse,
    status_code=201,
)
def create_employee(
    data: EmployeeCreate,
    current_user: User = Depends(require_hr),
):

    with Session(engine) as session:

        company = session.get(
            Company,
            data.company_id,
        )

        if company is None:
            raise HTTPException(
                status_code=404,
                detail="Company not found",
            )

        employee = Employee(
            **data.model_dump()
        )

        session.add(employee)

        try:
            session.commit()

        except IntegrityError:
            session.rollback()

            raise HTTPException(
                status_code=409,
                detail=(
                    "An employee with this national ID "
                    "or social security number already exists"
                ),
            )

        session.refresh(employee)

        return {
            "id": employee.id,
            "company_id": employee.company_id,
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
            "social_security_number":
                employee.social_security_number,
            "username": None,
        }


# ============================================================
# EDITAR EMPLEADO
# ============================================================

@app.put(
    "/api/employees/{employee_id}",
    response_model=EmployeeResponse,
)
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    current_user: User = Depends(require_hr),
):

    with Session(engine) as session:

        employee = session.get(
            Employee,
            employee_id,
        )

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        company = session.get(
            Company,
            data.company_id,
        )

        if company is None:
            raise HTTPException(
                status_code=404,
                detail="Company not found",
            )

        existing_user = session.scalar(
            select(User).where(
                User.username == data.username
            )
        )

        if (
            existing_user is not None
            and existing_user.employee_id != employee_id
        ):
            raise HTTPException(
                status_code=409,
                detail="This username is already in use",
            )

        employee.company_id = data.company_id
        employee.first_name = data.first_name
        employee.last_name = data.last_name
        employee.national_id = data.national_id
        employee.nationality = data.nationality
        employee.gender = data.gender
        employee.birth_date = data.birth_date
        employee.address = data.address
        employee.job_category = data.job_category
        employee.job_title = data.job_title
        employee.seniority_date = data.seniority_date
        employee.social_security_number = (
            data.social_security_number
        )

        user = session.scalar(
            select(User).where(
                User.employee_id == employee_id
            )
        )

        if user is not None:
            user.username = data.username

        try:
            session.commit()

        except IntegrityError:
            session.rollback()

            raise HTTPException(
                status_code=409,
                detail=(
                    "An employee or username with these "
                    "details already exists"
                ),
            )

        session.refresh(employee)

        return {
            "id": employee.id,
            "company_id": employee.company_id,
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
            "social_security_number":
                employee.social_security_number,
            "username": (
                user.username
                if user is not None
                else None
            ),
        }


# ============================================================
# OBTENER EMPLEADO
# ============================================================

@app.get(
    "/api/employees/{employee_id}",
    response_model=EmployeeResponse,
)
def get_employee(
    employee_id: int,
    current_user: User = Depends(get_current_user),
):

    if current_user.role == UserRole.EMPLOYEE:

        if current_user.employee_id != employee_id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only access your own "
                    "employee profile"
                ),
            )

    with Session(engine) as session:

        employee = session.get(
            Employee,
            employee_id,
        )

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        username = None

        if employee.user is not None:
            username = employee.user.username

        return {
            "id": employee.id,
            "company_id": employee.company_id,
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
            "social_security_number":
                employee.social_security_number,
            "username": username,
        }


# ============================================================
# CONTRATOS
# ============================================================

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
                detail=(
                    "You can only access your own "
                    "contracts"
                ),
            )

    with Session(engine) as session:

        employee = session.get(
            Employee,
            employee_id,
        )

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

        employee = session.get(
            Employee,
            employee_id,
        )

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


# ============================================================
# SUBIR CONTRATO
# ============================================================

@app.post(
    "/api/employees/{employee_id}/contracts/"
    "{contract_id}/document",
)
def upload_contract_document(
    employee_id: int,
    contract_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_hr),
):

    allowed_extensions = {
        ".pdf",
        ".doc",
        ".docx",
    }

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="A file name is required",
        )

    extension = Path(
        file.filename
    ).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only PDF, DOC and DOCX files are allowed"
            ),
        )

    with Session(engine) as session:

        contract = session.get(
            Contract,
            contract_id,
        )

        if (
            contract is None
            or contract.employee_id != employee_id
        ):
            raise HTTPException(
                status_code=404,
                detail="Contract not found",
            )

        upload_dir = Path(
            "uploads/contracts"
        )

        upload_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        file_path = (
            upload_dir
            / f"contract_{contract.id}{extension}"
        )

        with file_path.open("wb") as buffer:
            buffer.write(
                file.file.read()
            )

        contract.document_path = str(
            file_path
        )

        session.commit()
        session.refresh(contract)

        return {
            "contract_id": contract.id,
            "document_path":
                contract.document_path,
        }


# ============================================================
# DESCARGAR CONTRATO
# ============================================================

@app.get(
    "/api/employees/{employee_id}/contracts/"
    "{contract_id}/document",
)
def download_contract_document(
    employee_id: int,
    contract_id: int,
    current_user: User = Depends(get_current_user),
):

    if current_user.role == UserRole.EMPLOYEE:

        if current_user.employee_id != employee_id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only access your own "
                    "contracts"
                ),
            )

    with Session(engine) as session:

        contract = session.get(
            Contract,
            contract_id,
        )

        if (
            contract is None
            or contract.employee_id != employee_id
        ):
            raise HTTPException(
                status_code=404,
                detail="Contract not found",
            )

        if not contract.document_path:
            raise HTTPException(
                status_code=404,
                detail="Contract document not found",
            )

        file_path = Path(
            contract.document_path
        )

        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Contract document not found",
            )

        media_types = {
            ".pdf": "application/pdf",
            ".doc": "application/msword",
            ".docx": (
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
        }

        return FileResponse(
            path=file_path,
            filename=file_path.name,
            media_type=media_types.get(
                file_path.suffix.lower()
            ),
        )


# ============================================================
# NOMINAS
# ============================================================

@app.get(
    "/api/employees/{employee_id}/nominas",
    response_model=list[NominaResponse],
)
def list_employee_nominas(
    employee_id: int,
    current_user: User = Depends(get_current_user),
):

    if current_user.role == UserRole.EMPLOYEE:

        if current_user.employee_id != employee_id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only access your own "
                    "nominas"
                ),
            )

    with Session(engine) as session:

        employee = session.get(
            Employee,
            employee_id,
        )

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        return session.scalars(
            select(Nomina)
            .where(
                Nomina.employee_id == employee_id
            )
            .order_by(
                Nomina.date.desc()
            )
        ).all()


# ============================================================
# SUBIR NOMINA
# ============================================================

@app.post(
    "/api/employees/{employee_id}/nominas/"
    "{nomina_id}/document",
)
def upload_nomina_document(
    employee_id: int,
    nomina_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_hr),
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="A file name is required",
        )

    extension = Path(
        file.filename
    ).suffix.lower()

    if extension != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed",
        )

    with Session(engine) as session:

        nomina = session.get(
            Nomina,
            nomina_id,
        )

        if (
            nomina is None
            or nomina.employee_id != employee_id
        ):
            raise HTTPException(
                status_code=404,
                detail="Nomina not found",
            )

        upload_dir = Path(
            "uploads/nominas"
        )

        upload_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        file_path = (
            upload_dir
            / f"nomina_{nomina.id}.pdf"
        )

        with file_path.open("wb") as buffer:
            buffer.write(
                file.file.read()
            )

        nomina.document_path = str(
            file_path
        )

        session.commit()
        session.refresh(nomina)

        return {
            "nomina_id": nomina.id,
            "document_path":
                nomina.document_path,
        }


# ============================================================
# DESCARGAR NOMINA
# ============================================================

@app.get(
    "/api/employees/{employee_id}/nominas/"
    "{nomina_id}/document",
)
def download_nomina_document(
    employee_id: int,
    nomina_id: int,
    current_user: User = Depends(get_current_user),
):

    if current_user.role == UserRole.EMPLOYEE:

        if current_user.employee_id != employee_id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only access your own "
                    "nominas"
                ),
            )

    with Session(engine) as session:

        nomina = session.get(
            Nomina,
            nomina_id,
        )

        if (
            nomina is None
            or nomina.employee_id != employee_id
        ):
            raise HTTPException(
                status_code=404,
                detail="Nomina not found",
            )

        if not nomina.document_path:
            raise HTTPException(
                status_code=404,
                detail="Nomina document not found",
            )

        file_path = Path(
            nomina.document_path
        )

        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Nomina document not found",
            )

        return FileResponse(
            path=file_path,
            filename=file_path.name,
            media_type="application/pdf",
        )