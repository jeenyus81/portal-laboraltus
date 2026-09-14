import base64
import json

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
from app.security import (
    create_access_token,
    hash_password,
    verify_password,
)


# ============================================================
# CREAR APLICACIÓN
# ============================================================

app = FastAPI()


# ============================================================
# LOGOS DE EMPRESA
# ============================================================

COMPANY_LOGOS_DIR = Path("uploads/company_logos")
COMPANY_LOGOS_DIR.mkdir(parents=True, exist_ok=True)


def _company_logo_files(company_id: int):
    return COMPANY_LOGOS_DIR.glob(f"company_{company_id}.*")


def _decode_company_logo(logo_data: str):
    if not isinstance(logo_data, str) or not logo_data.startswith("data:"):
        raise HTTPException(status_code=400, detail="El logo debe ser una imagen en formato data URL")

    try:
        header, encoded = logo_data.split(",", 1)
        mime_type = header[5:].split(";", 1)[0].lower()
        allowed_types = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/svg+xml": ".svg",
        }
        extension = allowed_types.get(mime_type)
        if extension is None:
            raise HTTPException(status_code=400, detail="El logo debe ser JPG, PNG, WEBP o SVG")
        content = base64.b64decode(encoded, validate=True)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="El logo no es valido")

    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="El logo no puede superar los 5 MB")

    return mime_type, extension, content


def _logo_data_url(path: Path, mime_type: str):
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def _contract_downloads_path() -> Path:
    path = Path("uploads/contracts/downloaded_contracts.json")
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def _read_downloaded_contracts() -> dict:
    path = _contract_downloads_path()

    if not path.exists():
        return {}

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _write_downloaded_contracts(data: dict):
    path = _contract_downloads_path()
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def _nomina_downloads_path() -> Path:
    path = Path("uploads/nominas/downloaded_nominas.json")
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def _read_downloaded_nominas() -> dict:
    path = _nomina_downloads_path()

    if not path.exists():
        return {}

    try:
        data = json.loads(
            path.read_text(encoding="utf-8")
        )
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _write_downloaded_nominas(data: dict):
    path = _nomina_downloads_path()
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


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

        company = session.get(Company, employee.company_id)

        company_name = ''
        company_logo = ''

        if company is not None:
            company_name = company.name

            logo_files = list(_company_logo_files(company.id))
            if logo_files:
                logo_path = logo_files[0]
                mime_types = {
                    ".jpg": "image/jpeg",
                    ".png": "image/png",
                    ".webp": "image/webp",
                    ".svg": "image/svg+xml",
                }
                mime_type = mime_types.get(
                    logo_path.suffix.lower()
                )

                if mime_type is not None:
                    company_logo = _logo_data_url(
                        logo_path,
                        mime_type,
                    )

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
            "company_name": company_name,
            "company_logo": company_logo,
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
            select(Company).order_by(
                Company.id
            )
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


@app.get("/api/companies/{company_id}/logo")
def get_company_logo(
    company_id: int,
    current_user: User = Depends(get_current_user),
):
    with Session(engine) as session:
        company = session.get(Company, company_id)
        if company is None:
            raise HTTPException(status_code=404, detail="Company not found")

        if current_user.role == UserRole.EMPLOYEE:
            employee = session.get(Employee, current_user.employee_id)
            if employee is None or employee.company_id != company_id:
                raise HTTPException(
                    status_code=403,
                    detail="You can only access your own company logo",
                )

    files = list(_company_logo_files(company_id))
    if not files:
        raise HTTPException(status_code=404, detail="Company logo not found")

    path = files[0]
    mime_types = {
        ".jpg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
    }
    mime_type = mime_types.get(path.suffix.lower())
    if mime_type is None:
        raise HTTPException(status_code=500, detail="Company logo format not supported")

    return {"logo": _logo_data_url(path, mime_type)}


@app.put("/api/companies/{company_id}/logo")
def save_company_logo(
    company_id: int,
    data: dict,
    current_user: User = Depends(require_hr),
):
    with Session(engine) as session:
        company = session.get(Company, company_id)
        if company is None:
            raise HTTPException(status_code=404, detail="Company not found")

    logo_data = data.get("logo")
    _mime_type, extension, content = _decode_company_logo(logo_data)

    for old_path in _company_logo_files(company_id):
        old_path.unlink(missing_ok=True)

    path = COMPANY_LOGOS_DIR / f"company_{company_id}{extension}"
    path.write_bytes(content)
    return {"logo": logo_data}


@app.delete("/api/companies/{company_id}/logo")
def delete_company_logo(
    company_id: int,
    current_user: User = Depends(require_hr),
):
    with Session(engine) as session:
        company = session.get(Company, company_id)
        if company is None:
            raise HTTPException(status_code=404, detail="Company not found")

    for old_path in _company_logo_files(company_id):
        old_path.unlink(missing_ok=True)

    return {"logo": ""}


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
            select(Employee).order_by(
                Employee.id
            )
        ).all()

        result = []

        for employee in employees:
            username = None

            if employee.user is not None:
                username = employee.user.username

            result.append(
                {
                    "id": employee.id,
                    "company_id":
                        employee.company_id,
                    "first_name":
                        employee.first_name,
                    "last_name":
                        employee.last_name,
                    "national_id":
                        employee.national_id,
                    "nationality":
                        employee.nationality,
                    "gender":
                        employee.gender,
                    "birth_date":
                        employee.birth_date,
                    "address":
                        employee.address,
                    "job_category":
                        employee.job_category,
                    "job_title":
                        employee.job_title,
                    "seniority_date":
                        employee.seniority_date,
                    "social_security_number":
                        employee.social_security_number,
                    "username":
                        username,
                }
            )

        return result


# ============================================================
# AÑADIR EMPLEADO
# ============================================================


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
            company_id=data.company_id,
            first_name=data.first_name,
            last_name=data.last_name,
            national_id=data.national_id,
            nationality=data.nationality,
            gender=data.gender,
            birth_date=data.birth_date,
            address=data.address,
            job_category=data.job_category,
            job_title=data.job_title,
            seniority_date=data.seniority_date,
            social_security_number=
                data.social_security_number,
        )

        user = User(
            username=data.username,
            password_hash=hash_password(
                data.password
            ),
            role=UserRole.EMPLOYEE,
            employee=employee,
        )

        session.add(employee)
        session.add(user)

        try:
            session.commit()

        except IntegrityError:
            session.rollback()

            raise HTTPException(
                status_code=409,
                detail=(
                    "An employee, social security "
                    "number or username with these "
                    "details already exists"
                ),
            )

        session.refresh(employee)
        session.refresh(user)

        return {
            "id": employee.id,
            "company_id":
                employee.company_id,
            "first_name":
                employee.first_name,
            "last_name":
                employee.last_name,
            "national_id":
                employee.national_id,
            "nationality":
                employee.nationality,
            "gender":
                employee.gender,
            "birth_date":
                employee.birth_date,
            "address":
                employee.address,
            "job_category":
                employee.job_category,
            "job_title":
                employee.job_title,
            "seniority_date":
                employee.seniority_date,
            "social_security_number":
                employee.social_security_number,
            "username":
                user.username,
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

        existing_user = session.scalar(
            select(User).where(
                User.username == data.username
            )
        )

        if (
            existing_user is not None
            and existing_user.employee_id
            != employee_id
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
                    "An employee or username with "
                    "these details already exists"
                ),
            )

        session.refresh(employee)

        username = None

        if user is not None:
            username = user.username

        return {
            "id": employee.id,
            "company_id":
                employee.company_id,
            "first_name":
                employee.first_name,
            "last_name":
                employee.last_name,
            "national_id":
                employee.national_id,
            "nationality":
                employee.nationality,
            "gender":
                employee.gender,
            "birth_date":
                employee.birth_date,
            "address":
                employee.address,
            "job_category":
                employee.job_category,
            "job_title":
                employee.job_title,
            "seniority_date":
                employee.seniority_date,
            "social_security_number":
                employee.social_security_number,
            "username":
                username,
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
                    "You can only access your "
                    "own employee profile"
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
            "company_id":
                employee.company_id,
            "first_name":
                employee.first_name,
            "last_name":
                employee.last_name,
            "national_id":
                employee.national_id,
            "nationality":
                employee.nationality,
            "gender":
                employee.gender,
            "birth_date":
                employee.birth_date,
            "address":
                employee.address,
            "job_category":
                employee.job_category,
            "job_title":
                employee.job_title,
            "seniority_date":
                employee.seniority_date,
            "social_security_number":
                employee.social_security_number,
            "username":
                username,
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
                    "You can only access your "
                    "own contracts"
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
# AÑADIR CONTRATO DIRECTAMENTE CON PDF
# ============================================================

@app.post(
    "/api/employees/{employee_id}/contracts/upload",
)
def create_contract_with_document(
    employee_id: int,
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
            start_date=date.today(),
            end_date=None,
            contract_type="Documento",
            document_path=None,
        )

        session.add(contract)
        session.commit()
        session.refresh(contract)

        upload_dir = Path(
            "uploads/contracts"
        )

        upload_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        file_path = (
            upload_dir
            / f"contract_{contract.id}.pdf"
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

        return contract

# ============================================================
# SUBIR DOCUMENTO DEL CONTRATO
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
                "Only PDF, DOC and DOCX "
                "files are allowed"
            ),
        )

    with Session(engine) as session:

        contract = session.get(
            Contract,
            contract_id,
        )

        if (
            contract is None
            or contract.employee_id
            != employee_id
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
# ESTADO DE DESCARGA DE CONTRATOS DEL EMPLEADO
# ============================================================


@app.get("/api/employees/{employee_id}/contracts/downloaded")
def list_downloaded_contracts(
    employee_id: int,
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.EMPLOYEE and current_user.employee_id != employee_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own downloaded contracts",
        )

    with Session(engine) as session:
        employee = session.get(Employee, employee_id)
        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

    downloads = _read_downloaded_contracts()
    employee_ids = set(
        int(contract_id)
        for contract_id in downloads.get(str(employee_id), [])
    )

    return {
        "contract_ids": sorted(employee_ids),
    }


@app.post("/api/employees/{employee_id}/contracts/{contract_id}/downloaded")
def mark_contract_downloaded(
    employee_id: int,
    contract_id: int,
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.EMPLOYEE and current_user.employee_id != employee_id:
        raise HTTPException(
            status_code=403,
            detail="You can only mark your own contracts as downloaded",
        )

    with Session(engine) as session:
        contract = session.get(Contract, contract_id)

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

    downloads = _read_downloaded_contracts()
    key = str(employee_id)
    current_ids = {
        int(value)
        for value in downloads.get(key, [])
    }
    current_ids.add(contract_id)
    downloads[key] = sorted(current_ids)
    _write_downloaded_contracts(downloads)

    return {
        "contract_id": contract_id,
        "downloaded": True,
    }


# ============================================================
# DESCARGAR DOCUMENTO DEL CONTRATO
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
                    "You can only access your "
                    "own contracts"
                ),
            )

    with Session(engine) as session:

        contract = session.get(
            Contract,
            contract_id,
        )

        if (
            contract is None
            or contract.employee_id
            != employee_id
        ):
            raise HTTPException(
                status_code=404,
                detail="Contract not found",
            )

        if not contract.document_path:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Contract document not found"
                ),
            )

        file_path = Path(
            contract.document_path
        )

        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail=(
                    "Contract document not found"
                ),
            )

        media_types = {
            ".pdf":
                "application/pdf",
            ".doc":
                "application/msword",
            ".docx":
                (
                    "application/vnd.openxmlformats-"
                    "officedocument.wordprocessingml."
                    "document"
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
                    "You can only access your "
                    "own nominas"
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
                Nomina.employee_id
                == employee_id
            )
            .order_by(
                Nomina.date.desc()
            )
        ).all()


# ============================================================
# SUBIR NÓMINA
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
            or nomina.employee_id
            != employee_id
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
# AÑADIR NÓMINA DIRECTAMENTE CON PDF
# ============================================================

@app.post(
    "/api/employees/{employee_id}/nominas/upload",
)
def create_nomina_with_document(
    employee_id: int,
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

        employee = session.get(
            Employee,
            employee_id,
        )

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        nomina = Nomina(
            employee_id=employee_id,
            date=date.today(),
            document_path=None,
        )

        session.add(nomina)
        session.commit()
        session.refresh(nomina)

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

        return nomina

# ============================================================
# ESTADO DE DESCARGA DE NÓMINAS DEL EMPLEADO
# ============================================================


@app.get("/api/employees/{employee_id}/nominas/downloaded")
def list_downloaded_nominas(
    employee_id: int,
    current_user: User = Depends(get_current_user),
):
    if (
        current_user.role == UserRole.EMPLOYEE
        and current_user.employee_id != employee_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only access your own downloaded nominas",
        )

    with Session(engine) as session:
        employee = session.get(Employee, employee_id)

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

    downloads = _read_downloaded_nominas()

    employee_ids = set(
        int(nomina_id)
        for nomina_id in downloads.get(str(employee_id), [])
    )

    return {
        "nomina_ids": sorted(employee_ids),
    }


@app.post(
    "/api/employees/{employee_id}/nominas/"
    "{nomina_id}/downloaded"
)
def mark_nomina_downloaded(
    employee_id: int,
    nomina_id: int,
    current_user: User = Depends(get_current_user),
):
    if (
        current_user.role == UserRole.EMPLOYEE
        and current_user.employee_id != employee_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only mark your own nominas as downloaded",
        )

    with Session(engine) as session:
        nomina = session.get(Nomina, nomina_id)

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

        file_path = Path(nomina.document_path)

        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Nomina document not found",
            )

    downloads = _read_downloaded_nominas()
    key = str(employee_id)

    current_ids = {
        int(value)
        for value in downloads.get(key, [])
    }

    current_ids.add(nomina_id)
    downloads[key] = sorted(current_ids)

    _write_downloaded_nominas(downloads)

    return {
        "nomina_id": nomina_id,
        "downloaded": True,
    }


# ============================================================
# DESCARGAR NÓMINA
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
                    "You can only access your "
                    "own nominas"
                ),
            )

    with Session(engine) as session:

        nomina = session.get(
            Nomina,
            nomina_id,
        )

        if (
            nomina is None
            or nomina.employee_id
            != employee_id
        ):
            raise HTTPException(
                status_code=404,
                detail="Nomina not found",
            )

        if not nomina.document_path:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Nomina document not found"
                ),
            )

        file_path = Path(
            nomina.document_path
        )

        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail=(
                    "Nomina document not found"
                ),
            )

        return FileResponse(
            path=file_path,
            filename=file_path.name,
            media_type="application/pdf",
        )