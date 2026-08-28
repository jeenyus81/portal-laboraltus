import { useRef, useState } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  // =========================================================
  // INPUTS DE ARCHIVOS DIRECTOS
  // =========================================================

  const contractFileInputRef = useRef(null)
  const nominaFileInputRef = useRef(null)

  // =========================================================
  // EMPRESAS
  // =========================================================

  const [companies, setCompanies] = useState([])
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [companiesError, setCompaniesError] = useState('')

  const [selectedCompany, setSelectedCompany] = useState(null)
  const [companyView, setCompanyView] = useState('companies')

  const [companyForm, setCompanyForm] = useState({
    name: '',
    tax_id: '',
    address: '',
  })

  const [editingCompany, setEditingCompany] = useState(null)
  const [companySaving, setCompanySaving] = useState(false)

  const [creatingCompany, setCreatingCompany] = useState(false)
  const [companyCreateSaving, setCompanyCreateSaving] = useState(false)
  const [companyCreateError, setCompanyCreateError] = useState('')

  // =========================================================
  // EMPLEADOS
  // =========================================================

  const [employees, setEmployees] = useState([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [employeesError, setEmployeesError] = useState('')

  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // =========================================================
  // EDICION DE EMPLEADO
  // =========================================================

  const [editingEmployee, setEditingEmployee] = useState(null)

  const [employeeForm, setEmployeeForm] = useState({
    first_name: '',
    last_name: '',
    job_title: '',
    job_category: '',
    nationality: '',
    username: '',
  })

  const [employeeSaving, setEmployeeSaving] = useState(false)
  const [employeeEditError, setEmployeeEditError] = useState('')

  // =========================================================
  // AÑADIR EMPLEADO
  // =========================================================

  const [creatingEmployee, setCreatingEmployee] = useState(false)
  const [employeeCreateSaving, setEmployeeCreateSaving] = useState(false)
  const [employeeCreateError, setEmployeeCreateError] = useState('')

  const [newEmployeeForm, setNewEmployeeForm] = useState({
    first_name: '',
    last_name: '',
    national_id: '',
    nationality: '',
    gender: '',
    birth_date: '',
    address: '',
    job_category: '',
    job_title: '',
    seniority_date: '',
    social_security_number: '',
    username: '',
    password: '',
  })

  // =========================================================
  // AÑADIR EMPLEADO
  // =========================================================

  function handleAddEmployee() {
    setCreatingEmployee(true)
    setEmployeeCreateError('')

    setNewEmployeeForm({
      first_name: '',
      last_name: '',
      national_id: '',
      nationality: '',
      gender: '',
      birth_date: '',
      address: '',
      job_category: '',
      job_title: '',
      seniority_date: '',
      social_security_number: '',
      username: '',
      password: '',
    })
  }

  function handleCancelCreateEmployee() {
    setCreatingEmployee(false)
    setEmployeeCreateError('')
  }

  async function handleCreateEmployee(event) {
    event.preventDefault()

    const token = localStorage.getItem('access_token')

    if (!token) {
      setEmployeeCreateError('No hay una sesion valida')
      return
    }

    if (!selectedCompany) {
      setEmployeeCreateError('No se ha seleccionado una empresa')
      return
    }

    setEmployeeCreateSaving(true)
    setEmployeeCreateError('')

    try {
      const response = await fetch(
        API_URL + '/api/employees',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            company_id: selectedCompany.id,
            first_name: newEmployeeForm.first_name,
            last_name: newEmployeeForm.last_name,
            national_id: newEmployeeForm.national_id,
            nationality: newEmployeeForm.nationality,
            gender: newEmployeeForm.gender,
            birth_date: newEmployeeForm.birth_date,
            address: newEmployeeForm.address,
            job_category: newEmployeeForm.job_category,
            job_title: newEmployeeForm.job_title,
            seniority_date: newEmployeeForm.seniority_date,
            social_security_number:
              newEmployeeForm.social_security_number,
            username: newEmployeeForm.username,
            password: newEmployeeForm.password,
          }),
        },
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.detail || 'No se pudo crear el empleado',
        )
      }

      setEmployees((previous) => [
        ...previous,
        data,
      ])

      setCreatingEmployee(false)

      setNewEmployeeForm({
        first_name: '',
        last_name: '',
        national_id: '',
        nationality: '',
        gender: '',
        birth_date: '',
        address: '',
        job_category: '',
        job_title: '',
        seniority_date: '',
        social_security_number: '',
        username: '',
        password: '',
      })
    } catch (err) {
      setEmployeeCreateError(err.message)
    } finally {
      setEmployeeCreateSaving(false)
    }
  }

  // =========================================================
  // CONTRATOS
  // =========================================================

  const [contracts, setContracts] = useState([])
  const [contractsLoading, setContractsLoading] = useState(false)
  const [contractsError, setContractsError] = useState('')

  const [selectedFiles, setSelectedFiles] = useState({})

  // =========================================================
  // NOMINAS
  // =========================================================

  const [nominas, setNominas] = useState([])
  const [nominasLoading, setNominasLoading] = useState(false)
  const [nominasError, setNominasError] = useState('')

  const [selectedNominaFiles, setSelectedNominaFiles] = useState({})

  // =========================================================
  // SECCION DEL EMPLEADO
  // =========================================================

  const [employeeSection, setEmployeeSection] =
    useState('contracts')

  // =========================================================
  // CARGAR EMPRESAS
  // =========================================================

  async function loadCompanies(token) {
    setCompaniesLoading(true)
    setCompaniesError('')

    try {
      const response = await fetch(
        API_URL + '/api/companies',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'No se pudieron cargar las empresas',
        )
      }

      setCompanies(Array.isArray(data) ? data : [])
    } catch (err) {
      setCompaniesError(err.message)
    } finally {
      setCompaniesLoading(false)
    }
  }

  // =========================================================
  // ENTRAR EN EMPRESA
  // =========================================================

  function handleEnterCompany(company) {
    setSelectedCompany(company)
    setCompanyView('company')
    setEditingCompany(null)
    setCompaniesError('')
  }

  // =========================================================
  // VOLVER A EMPRESAS
  // =========================================================

  function handleBackToCompanies() {
    setSelectedCompany(null)
    setEditingCompany(null)
    setCompanyView('companies')

    setCompanyForm({
      name: '',
      tax_id: '',
      address: '',
    })

    setCompaniesError('')
  }

  // =========================================================
  // AÑADIR EMPRESA
  // =========================================================

  function handleAddCompany() {
    setCreatingCompany(true)
    setCompanyCreateError('')

    setCompanyForm({
      name: '',
      tax_id: '',
      address: '',
    })
  }

  function handleCancelCreateCompany() {
    setCreatingCompany(false)
    setCompanyCreateError('')

    setCompanyForm({
      name: '',
      tax_id: '',
      address: '',
    })
  }

  async function handleCreateCompany(event) {
    event.preventDefault()

    const token = localStorage.getItem('access_token')

    if (!token) {
      setCompanyCreateError('No hay una sesion valida')
      return
    }

    setCompanyCreateSaving(true)
    setCompanyCreateError('')

    try {
      const response = await fetch(
        API_URL + '/api/companies',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            name: companyForm.name,
            tax_id: companyForm.tax_id,
            address: companyForm.address,
          }),
        },
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.detail || 'No se pudo crear la empresa',
        )
      }

      setCompanies((previous) => [
        ...previous,
        data,
      ])

      setCreatingCompany(false)

      setCompanyForm({
        name: '',
        tax_id: '',
        address: '',
      })
    } catch (err) {
      setCompanyCreateError(err.message)
    } finally {
      setCompanyCreateSaving(false)
    }
  }

  // =========================================================
  // EDITAR EMPRESA
  // =========================================================

  function handleEditCompany(company) {
    setEditingCompany(company)

    setCompanyForm({
      name: company.name || '',
      tax_id: company.tax_id || '',
      address: company.address || '',
    })

    setCompaniesError('')
  }

  function handleCancelEditCompany() {
    setEditingCompany(null)

    setCompanyForm({
      name: '',
      tax_id: '',
      address: '',
    })

    setCompaniesError('')
  }

  async function handleUpdateCompany(event) {
    event.preventDefault()

    const token = localStorage.getItem('access_token')

    if (!token) {
      setCompaniesError('No hay una sesion valida')
      return
    }

    if (!editingCompany) {
      return
    }

    setCompanySaving(true)
    setCompaniesError('')

    try {
      const response = await fetch(
        API_URL + '/api/companies/' + editingCompany.id,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            name: companyForm.name,
            tax_id: companyForm.tax_id,
            address: companyForm.address,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'No se pudo actualizar la empresa',
        )
      }

      setCompanies((previous) =>
        previous.map((company) =>
          company.id === data.id ? data : company,
        ),
      )

      setSelectedCompany(data)
      setEditingCompany(null)

      setCompanyForm({
        name: '',
        tax_id: '',
        address: '',
      })
    } catch (err) {
      setCompaniesError(err.message)
    } finally {
      setCompanySaving(false)
    }
  }

  // =========================================================
  // CARGAR EMPLEADOS
  // =========================================================

  function getEmployeesForSelectedCompany() {
    if (!selectedCompany) {
      return employees
    }

    return employees.filter(
      (employee) =>
        employee.company_id === selectedCompany.id,
    )
  }

  async function loadEmployees(token) {
    setEmployeesLoading(true)
    setEmployeesError('')

    try {
      const response = await fetch(
        API_URL + '/api/employees',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'No se pudieron cargar los empleados',
        )
      }

      setEmployees(Array.isArray(data) ? data : [])
    } catch (err) {
      setEmployeesError(err.message)
    } finally {
      setEmployeesLoading(false)
    }
  }

  // =========================================================
  // ENTRAR EN EMPLEADOS DE LA EMPRESA
  // =========================================================

  async function handleEnterEmployees() {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setEmployeesError('No hay una sesion valida')
      return
    }

    await loadEmployees(token)

    setCompanyView('employees')
    setSelectedEmployee(null)
    setCreatingEmployee(false)
    setContracts([])
    setNominas([])
    setSelectedFiles({})
    setSelectedNominaFiles({})
  }

  // =========================================================
  // VOLVER A EMPRESA DESDE EMPLEADOS
  // =========================================================

  function handleBackToCompany() {
    setCompanyView('company')
    setSelectedEmployee(null)
    setCreatingEmployee(false)
    setContracts([])
    setNominas([])
    setSelectedFiles({})
    setSelectedNominaFiles({})

    setEmployeesError('')
    setContractsError('')
    setNominasError('')
  }

  // =========================================================
  // EDITAR EMPLEADO
  // =========================================================

  function handleEditEmployee(employee) {
    setEditingEmployee(employee)

    setEmployeeForm({
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      job_title: employee.job_title || '',
      job_category: employee.job_category || '',
      nationality: employee.nationality || '',
      username: employee.username || '',
    })

    setEmployeeEditError('')
  }

  function handleCancelEditEmployee() {
    setEditingEmployee(null)

    setEmployeeForm({
      first_name: '',
      last_name: '',
      job_title: '',
      job_category: '',
      nationality: '',
      username: '',
    })

    setEmployeeEditError('')
  }

  async function handleUpdateEmployee(event) {
    event.preventDefault()

    const token = localStorage.getItem('access_token')

    if (!token) {
      setEmployeeEditError('No hay una sesion valida')
      return
    }

    if (!editingEmployee) {
      return
    }

    setEmployeeSaving(true)
    setEmployeeEditError('')

    try {
      const response = await fetch(
        API_URL + '/api/employees/' + editingEmployee.id,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            company_id: editingEmployee.company_id,
            first_name: employeeForm.first_name,
            last_name: employeeForm.last_name,
            national_id: editingEmployee.national_id,
            nationality: employeeForm.nationality,
            gender: editingEmployee.gender,
            birth_date: editingEmployee.birth_date,
            address: editingEmployee.address,
            job_category: employeeForm.job_category,
            job_title: employeeForm.job_title,
            seniority_date: editingEmployee.seniority_date,
            social_security_number:
              editingEmployee.social_security_number,
            username: employeeForm.username,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'No se pudo actualizar el empleado',
        )
      }

      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === data.id ? data : employee,
        ),
      )

      setSelectedEmployee(data)
      setEditingEmployee(null)

      setEmployeeForm({
        first_name: '',
        last_name: '',
        job_title: '',
        job_category: '',
        nationality: '',
        username: '',
      })
    } catch (err) {
      setEmployeeEditError(err.message)
    } finally {
      setEmployeeSaving(false)
    }
  }

  // =========================================================
  // CONTRATOS
  // =========================================================

  async function loadContracts(employeeId, token) {
    setContractsLoading(true)
    setContractsError('')

    try {
      const response = await fetch(
        API_URL +
          '/api/employees/' +
          employeeId +
          '/contracts',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'No se pudieron cargar los contratos',
        )
      }

      setContracts(Array.isArray(data) ? data : [])
    } catch (err) {
      setContractsError(err.message)
    } finally {
      setContractsLoading(false)
    }
  }

  // =========================================================
  // NOMINAS
  // =========================================================

  async function loadNominas(employeeId, token) {
    setNominasLoading(true)
    setNominasError('')

    try {
      const response = await fetch(
        API_URL +
          '/api/employees/' +
          employeeId +
          '/nominas',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'No se pudieron cargar las nominas',
        )
      }

      setNominas(Array.isArray(data) ? data : [])
    } catch (err) {
      setNominasError(err.message)
    } finally {
      setNominasLoading(false)
    }
  }

  // =========================================================
  // ENTRAR EN EMPLEADO
  // =========================================================

  async function handleEnterEmployee(employee) {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setEmployeesError('No hay una sesion valida')
      return
    }

    setSelectedEmployee(employee)
    setCompanyView('employee')
    setEmployeeSection('employee')
    setSelectedFiles({})
    setSelectedNominaFiles({})
    setContracts([])
    setNominas([])
    setEditingEmployee(null)

    setContractsError('')
    setNominasError('')
    setEmployeeEditError('')
  }

  // =========================================================
  // ENTRAR EN MENU DE CONTRATOS
  // =========================================================

  async function handleViewContracts(employee) {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setContractsError('No hay una sesion valida')
      return
    }

    setSelectedEmployee(employee)
    setEmployeeSection('contracts')
    setCompanyView('employeeContracts')

    setSelectedFiles({})
    setSelectedNominaFiles({})

    await loadContracts(employee.id, token)
  }

  // =========================================================
  // ENTRAR EN MENU DE NOMINAS
  // =========================================================

  async function handleViewNominas(employee) {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setNominasError('No hay una sesion valida')
      return
    }

    setSelectedEmployee(employee)
    setEmployeeSection('nominas')
    setCompanyView('employeeNominas')

    setSelectedFiles({})
    setSelectedNominaFiles({})

    await loadNominas(employee.id, token)
  }

  // =========================================================
  // AÑADIR CONTRATOS
  // =========================================================

  function handleAddContracts() {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setContractsError('No hay una sesion valida')
      return
    }

    if (!selectedEmployee) {
      setContractsError('No se ha seleccionado ningún empleado')
      return
    }

    setContractsError('')

    if (contractFileInputRef.current) {
      contractFileInputRef.current.value = ''
      contractFileInputRef.current.click()
    }
  }

  // =========================================================
  // ARCHIVO DE CONTRATO
  // =========================================================

  async function handleDirectContractFile(event) {
    const file = event.target.files?.[0]

    event.target.value = ''

    if (!file) {
      return
    }

    if (!selectedEmployee) {
      setContractsError('No se ha seleccionado ningún empleado')
      return
    }

    if (file.type !== 'application/pdf') {
      setContractsError('El archivo debe ser un PDF')
      return
    }

    const contractsWithoutDocument = contracts.filter(
      (contract) => !contract.document_path,
    )

    let targetContract = contractsWithoutDocument[0]

    if (!targetContract) {
      targetContract = contracts[0]
    }

    if (!targetContract) {
      setContractsError(
        'Este empleado no tiene ningún contrato registrado',
      )
      return
    }

    await handleUploadDocument(
      targetContract,
      selectedEmployee.id,
      file,
    )
  }

  // =========================================================
  // ALMACEN DE CONTRATOS
  // =========================================================

  async function handleContractStore() {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setContractsError('No hay una sesion valida')
      return
    }

    setEmployeeSection('contractStore')
    setCompanyView('employeeContractStore')
    setSelectedFiles({})

    if (selectedEmployee) {
      await loadContracts(selectedEmployee.id, token)
    }
  }

  // =========================================================
  // AÑADIR NOMINAS
  // =========================================================

  function handleAddNominas() {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setNominasError('No hay una sesion valida')
      return
    }

    if (!selectedEmployee) {
      setNominasError('No se ha seleccionado ningún empleado')
      return
    }

    setNominasError('')

    if (nominaFileInputRef.current) {
      nominaFileInputRef.current.value = ''
      nominaFileInputRef.current.click()
    }
  }

  // =========================================================
  // ARCHIVO DE NOMINA
  // =========================================================

  async function handleDirectNominaFile(event) {
    const file = event.target.files?.[0]

    event.target.value = ''

    if (!file) {
      return
    }

    if (!selectedEmployee) {
      setNominasError('No se ha seleccionado ningún empleado')
      return
    }

    if (file.type !== 'application/pdf') {
      setNominasError('El archivo debe ser un PDF')
      return
    }

    const nominasWithoutDocument = nominas.filter(
      (nomina) => !nomina.document_path,
    )

    let targetNomina = nominasWithoutDocument[0]

    if (!targetNomina) {
      targetNomina = nominas[0]
    }

    if (!targetNomina) {
      setNominasError(
        'Este empleado no tiene ninguna nómina registrada',
      )
      return
    }

    await handleUploadNominaDocument(
      targetNomina,
      selectedEmployee.id,
      file,
    )
  }

  // =========================================================
  // ALMACEN DE NOMINAS
  // =========================================================

  async function handleNominaStore() {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setNominasError('No hay una sesion valida')
      return
    }

    setEmployeeSection('nominaStore')
    setCompanyView('employeeNominaStore')
    setSelectedNominaFiles({})

    if (selectedEmployee) {
      await loadNominas(selectedEmployee.id, token)
    }
  }

  // =========================================================
  // VOLVER AL EMPLEADO
  // =========================================================

  function handleBackToEmployee() {
    setCompanyView('employee')
    setEmployeeSection('employee')

    setContracts([])
    setNominas([])

    setSelectedFiles({})
    setSelectedNominaFiles({})

    setContractsError('')
    setNominasError('')
  }

  // =========================================================
  // VOLVER AL MENU DE CONTRATOS
  // =========================================================

  function handleBackToContractsMenu() {
    setCompanyView('employeeContracts')
    setEmployeeSection('contracts')

    setSelectedFiles({})
    setContractsError('')
  }

  // =========================================================
  // VOLVER AL MENU DE NOMINAS
  // =========================================================

  function handleBackToNominasMenu() {
    setCompanyView('employeeNominas')
    setEmployeeSection('nominas')

    setSelectedNominaFiles({})
    setNominasError('')
  }

  // =========================================================
  // VOLVER A EMPLEADOS
  // =========================================================

  function handleBackToEmployees() {
    setCompanyView('employees')
    setSelectedEmployee(null)
    setEditingEmployee(null)
    setCreatingEmployee(false)

    setContracts([])
    setNominas([])

    setSelectedFiles({})
    setSelectedNominaFiles({})

    setEmployeesError('')
    setContractsError('')
    setNominasError('')
    setEmployeeEditError('')
    setEmployeeCreateError('')
  }

  // =========================================================
  // DESCARGAR CONTRATO
  // =========================================================

  async function handleDownload(
    contract,
    employeeId = null,
  ) {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setContractsError('No hay una sesion valida')
      return
    }

    const targetEmployeeId =
      employeeId || user?.id

    if (!targetEmployeeId) {
      setContractsError(
        'No se ha podido identificar al empleado',
      )
      return
    }

    setContractsError('')

    try {
      const url =
        API_URL +
        '/api/employees/' +
        targetEmployeeId +
        '/contracts/' +
        contract.id +
        '/document'

      const response = await fetch(url, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)

        throw new Error(
          data?.detail ||
            'No se pudo descargar el documento',
        )
      }

      const blob = await response.blob()

      const downloadUrl =
        window.URL.createObjectURL(blob)

      const link = document.createElement('a')

      link.href = downloadUrl
      link.download = getDocumentName(contract)

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      setContractsError(err.message)
    }
  }

  // =========================================================
  // SUBIR CONTRATO
  // =========================================================

  async function handleUploadDocument(
    contract,
    employeeId,
    file,
  ) {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setContractsError('No hay una sesion valida')
      return
    }

    if (!file) {
      setContractsError('Selecciona un archivo PDF')
      return
    }

    if (file.type !== 'application/pdf') {
      setContractsError('El archivo debe ser un PDF')
      return
    }

    setContractsError('')

    try {
      const formData = new FormData()

      formData.append('file', file)

      const url =
        API_URL +
        '/api/employees/' +
        employeeId +
        '/contracts/' +
        contract.id +
        '/document'

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        body: formData,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            'No se pudo subir el documento',
        )
      }

      setSelectedFiles((previous) => {
        const updated = { ...previous }

        delete updated[contract.id]

        return updated
      })

      await loadContracts(employeeId, token)
    } catch (err) {
      setContractsError(err.message)
    }
  }

  // =========================================================
  // DESCARGAR NOMINA
  // =========================================================

  async function handleDownloadNomina(
    nomina,
    employeeId = null,
  ) {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setNominasError('No hay una sesion valida')
      return
    }

    const targetEmployeeId =
      employeeId || user?.id

    if (!targetEmployeeId) {
      setNominasError(
        'No se ha podido identificar al empleado',
      )
      return
    }

    setNominasError('')

    try {
      const url =
        API_URL +
        '/api/employees/' +
        targetEmployeeId +
        '/nominas/' +
        nomina.id +
        '/document'

      const response = await fetch(url, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)

        throw new Error(
          data?.detail ||
            'No se pudo descargar la nomina',
        )
      }

      const blob = await response.blob()

      const downloadUrl =
        window.URL.createObjectURL(blob)

      const link = document.createElement('a')

      link.href = downloadUrl
      link.download = getNominaDocumentName(nomina)

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      setNominasError(err.message)
    }
  }

  // =========================================================
  // SUBIR NOMINA
  // =========================================================

  async function handleUploadNominaDocument(
    nomina,
    employeeId,
    file,
  ) {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setNominasError('No hay una sesion valida')
      return
    }

    if (!file) {
      setNominasError('Selecciona un archivo PDF')
      return
    }

    if (file.type !== 'application/pdf') {
      setNominasError('El archivo debe ser un PDF')
      return
    }

    setNominasError('')

    try {
      const formData = new FormData()

      formData.append('file', file)

      const url =
        API_URL +
        '/api/employees/' +
        employeeId +
        '/nominas/' +
        nomina.id +
        '/document'

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        body: formData,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            'No se pudo subir la nomina',
        )
      }

      setSelectedNominaFiles((previous) => {
        const updated = { ...previous }

        delete updated[nomina.id]

        return updated
      })

      await loadNominas(employeeId, token)
    } catch (err) {
      setNominasError(err.message)
    }
  }

  // =========================================================
  // NOMBRES DE DOCUMENTOS
  // =========================================================

  function getDocumentName(contract) {
    if (contract.document_path) {
      const normalizedPath =
        contract.document_path.replaceAll('\\', '/')

      const parts = normalizedPath.split('/')

      return (
        parts[parts.length - 1] ||
        'contrato-' + contract.id + '.pdf'
      )
    }

    return 'contrato-' + contract.id + '.pdf'
  }

  function getNominaDocumentName(nomina) {
    if (nomina.document_path) {
      const normalizedPath =
        nomina.document_path.replaceAll('\\', '/')

      const parts = normalizedPath.split('/')

      return (
        parts[parts.length - 1] ||
        'nomina-' + nomina.id + '.pdf'
      )
    }

    return 'nomina-' + nomina.id + '.pdf'
  }

  // =========================================================
  // FECHAS
  // =========================================================

  function formatDate(value) {
    if (!value) {
      return 'Sin fecha'
    }

    const parts = value.split('-')

    if (parts.length !== 3) {
      return value
    }

    return (
      parts[2] +
      '/' +
      parts[1] +
      '/' +
      parts[0]
    )
  }

  // =========================================================
  // LOGIN
  // =========================================================

  async function handleLogin(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        API_URL + '/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'No se pudo iniciar sesion',
        )
      }

      localStorage.setItem(
        'access_token',
        data.access_token,
      )

      if (data.role === 'HR') {
        const loggedUser = {
          username: username,
          role: data.role,
        }

        setUser(loggedUser)
        setLoggedIn(true)

        setCompanyView('dashboard')
        setSelectedCompany(null)

        await loadCompanies(data.access_token)
        await loadEmployees(data.access_token)
      } else {
        const meResponse = await fetch(
          API_URL + '/api/me',
          {
            headers: {
              Authorization:
                'Bearer ' + data.access_token,
            },
          },
        )

        const me = await meResponse.json()

        if (!meResponse.ok) {
          throw new Error(
            me.detail || 'No se pudo cargar el perfil',
          )
        }

        const loggedUser = {
          ...me,
          role: data.role,
          username: username,
        }

        setUser(loggedUser)
        setLoggedIn(true)

        await loadContracts(
          me.id,
          data.access_token,
        )

        await loadNominas(
          me.id,
          data.access_token,
        )
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  function handleLogout() {
    localStorage.removeItem('access_token')

    setUser(null)
    setCompanies([])
    setContracts([])
    setNominas([])
    setEmployees([])

    setSelectedCompany(null)
    setSelectedEmployee(null)

    setSelectedFiles({})
    setSelectedNominaFiles({})

    setCompanyView('companies')
    setEmployeeSection('contracts')

    setEditingCompany(null)
    setCreatingCompany(false)

    setEditingEmployee(null)
    setCreatingEmployee(false)

    setCompanyForm({
      name: '',
      tax_id: '',
      address: '',
    })

    setEmployeeForm({
      first_name: '',
      last_name: '',
      job_title: '',
      job_category: '',
      nationality: '',
      username: '',
    })

    setNewEmployeeForm({
      first_name: '',
      last_name: '',
      national_id: '',
      nationality: '',
      gender: '',
      birth_date: '',
      address: '',
      job_category: '',
      job_title: '',
      seniority_date: '',
      social_security_number: '',
      username: '',
      password: '',
    })

    setCompaniesError('')
    setCompanyCreateError('')
    setContractsError('')
    setNominasError('')
    setEmployeesError('')
    setEmployeeEditError('')
    setEmployeeCreateError('')

    setLoggedIn(false)

    setUsername('')
    setPassword('')
  }

  // =========================================================
  // PORTAL RRHH
  // =========================================================

if (loggedIn && user && user.role === 'HR') {
  return (
    <main className="app hr-app">
      <aside className="hr-sidebar">

<div className="hr-brand">
  <img
    src="/logo-laboraltus.png"
    alt="Laboraltus"
    className="hr-logo"
  />
</div>

        <nav className="hr-nav">

<button
  type="button"
  className={
    companyView === 'dashboard'
      ? 'hr-nav-button active'
      : 'hr-nav-button'
  }
  onClick={() => {
    setCompanyView('dashboard')
    setSelectedCompany(null)
    setSelectedEmployee(null)
  }}
>
  <span className="hr-nav-icon">⌂</span>
  Inicio
</button>

          <button
            type="button"
            className="hr-nav-button"
            onClick={() => {
              setCompanyView(
                selectedCompany ? 'company' : 'companies'
              )
            }}
          >
            <span className="hr-nav-icon">▣</span>
            Empresas
          </button>

          <button
            type="button"
            className="hr-nav-button"
            onClick={() => {
              if (selectedCompany) {
                handleEnterEmployees()
              } else {
                setCompanyView('companies')
              }
            }}
          >
            <span className="hr-nav-icon">●</span>
            Empleados
          </button>

          <button
            type="button"
            className="hr-nav-button"
            onClick={() => {
              if (selectedEmployee) {
                handleViewContracts(selectedEmployee)
              } else if (selectedCompany) {
                handleEnterEmployees()
              } else {
                setCompanyView('companies')
              }
            }}
          >
            <span className="hr-nav-icon">▤</span>
            Contratos
          </button>

          <button
            type="button"
            className="hr-nav-button"
            onClick={() => {
              if (selectedEmployee) {
                handleViewNominas(selectedEmployee)
              } else if (selectedCompany) {
                handleEnterEmployees()
              } else {
                setCompanyView('companies')
              }
            }}
          >
            <span className="hr-nav-icon">▥</span>
            Nóminas
          </button>

        </nav>

        <div className="hr-sidebar-bottom">

          <div className="hr-user-box">
            <div className="hr-user-avatar">
              {(user.username || 'H').charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.username}</strong>
              <span>RR. HH.</span>
            </div>
          </div>

          <button
            type="button"
            className="hr-logout-button"
            onClick={handleLogout}
          >
            <span className="hr-nav-icon">↪</span>
            Cerrar sesión
          </button>

        </div>

      </aside>

      <div className="hr-main">
        <section className="card hr-card">

          <input
            ref={contractFileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={handleDirectContractFile}
          />

          <input
            ref={nominaFileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={handleDirectNominaFile}
          />

          <div className="header">
            <div>
              <p className="eyebrow">
                Portal Laboraltus
              </p>

              <h1>
                Panel de RR. HH.
              </h1>

              <p>
                Bienvenido, {user.username}
              </p>
            </div>

            <button
              type="button"
              className="secondary"
              onClick={handleLogout}
            >
              Cerrar sesion
            </button>
          </div>
{/* ================================================= */}
{/* DASHBOARD RR. HH. */}
{/* ================================================= */}

{companyView === 'dashboard' && (
  <div className="hr-dashboard">

    <div className="hr-dashboard-header">
      <div>
        <p className="eyebrow">
          Resumen
        </p>

        <h2>
          Buenos días, {user.username}
        </h2>

        <p className="muted">
          Aquí tienes una visión general del portal de RR. HH.
        </p>
      </div>
    </div>

    <div className="hr-dashboard-grid">

      <article className="hr-dashboard-card">
        <div className="hr-dashboard-icon">
          ▣
        </div>

        <div>
          <span>
            Empresas
          </span>

          <strong>
            {companies.length}
          </strong>

          <p>
            Empresas registradas
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCompanyView('companies')
            setSelectedCompany(null)
            setSelectedEmployee(null)
          }}
        >
          Ver empresas
        </button>
      </article>

      <article className="hr-dashboard-card">
        <div className="hr-dashboard-icon">
          ●
        </div>

        <div>
          <span>
            Empleados
          </span>

          <strong>
            {employees.length}
          </strong>

          <p>
            Empleados registrados
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (selectedCompany) {
              handleEnterEmployees()
            } else {
              setCompanyView('companies')
            }
          }}
        >
          Ver empleados
        </button>
      </article>

      <article className="hr-dashboard-card">
        <div className="hr-dashboard-icon">
          ▤
        </div>

        <div>
          <span>
            Contratos
          </span>

          <strong>
            {selectedEmployee
              ? contracts.length
              : '—'}
          </strong>

          <p>
            {selectedEmployee
              ? 'Contratos del empleado seleccionado'
              : 'Selecciona un empleado para gestionarlos'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (selectedEmployee) {
              handleViewContracts(selectedEmployee)
            } else if (selectedCompany) {
              handleEnterEmployees()
            } else {
              setCompanyView('companies')
            }
          }}
        >
          Gestionar contratos
        </button>
      </article>

      <article className="hr-dashboard-card">
        <div className="hr-dashboard-icon">
          ▥
        </div>

        <div>
          <span>
            Nóminas
          </span>

          <strong>
            {selectedEmployee
              ? nominas.length
              : '—'}
          </strong>

          <p>
            {selectedEmployee
              ? 'Nóminas del empleado seleccionado'
              : 'Selecciona un empleado para gestionarlas'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (selectedEmployee) {
              handleViewNominas(selectedEmployee)
            } else if (selectedCompany) {
              handleEnterEmployees()
            } else {
              setCompanyView('companies')
            }
          }}
        >
          Gestionar nóminas
        </button>
      </article>

    </div>

    <div className="hr-dashboard-actions">

      <div>
        <p className="eyebrow">
          Accesos rápidos
        </p>

        <h2>
          Gestión habitual
        </h2>
      </div>

      <div className="hr-dashboard-action-buttons">

        <button
          type="button"
          onClick={handleAddCompany}
        >
          + Añadir empresa
        </button>

        <button
          type="button"
          onClick={() => {
            if (selectedCompany) {
              handleAddEmployee()
            } else {
              setCompanyView('companies')
            }
          }}
        >
          + Añadir empleado
        </button>

      </div>

    </div>

  </div>
)}
          {/* ================================================= */}
          {/* LISTA DE EMPRESAS */}
          {/* ================================================= */}

          {companyView === 'companies' && (
            <div className="contracts">

              <div className="section-header">

                <div>
                  <p className="eyebrow">
                    Gestion de empresas
                  </p>

                  <h2>
                    Empresas
                  </h2>
                </div>

                <div className="contract-document">

                  {!companiesLoading &&
                    companies.length > 0 && (
                      <span className="contract-count">
                        {companies.length}{' '}
                        {companies.length === 1
                          ? 'empresa'
                          : 'empresas'}
                      </span>
                    )}

                  <button
                    type="button"
                    onClick={handleAddCompany}
                  >
                    Añadir empresa
                  </button>

                </div>

              </div>

              {/* ================================================= */}
              {/* FORMULARIO AÑADIR EMPRESA */}
              {/* ================================================= */}

              {creatingCompany && (
                <div className="profile">

                  <div className="section-header">
                    <div>
                      <p className="eyebrow">
                        Gestion de empresas
                      </p>

                      <h2>
                        Añadir empresa
                      </h2>
                    </div>
                  </div>

                  <form
                    onSubmit={handleCreateCompany}
                  >

                    <label htmlFor="new-company-name">
                      Nombre
                    </label>

                    <input
                      id="new-company-name"
                      type="text"
                      value={companyForm.name}
                      onChange={(event) =>
                        setCompanyForm({
                          ...companyForm,
                          name: event.target.value,
                        })
                      }
                      required
                    />

                    <label htmlFor="new-company-tax-id">
                      CIF / NIF
                    </label>

                    <input
                      id="new-company-tax-id"
                      type="text"
                      value={companyForm.tax_id}
                      onChange={(event) =>
                        setCompanyForm({
                          ...companyForm,
                          tax_id: event.target.value,
                        })
                      }
                      required
                    />

                    <label htmlFor="new-company-address">
                      Direccion
                    </label>

                    <input
                      id="new-company-address"
                      type="text"
                      value={companyForm.address}
                      onChange={(event) =>
                        setCompanyForm({
                          ...companyForm,
                          address: event.target.value,
                        })
                      }
                      required
                    />

                    {companyCreateError && (
                      <p className="error">
                        {companyCreateError}
                      </p>
                    )}

                    <div className="contract-document">

                      <button
                        type="submit"
                        disabled={companyCreateSaving}
                      >
                        {companyCreateSaving
                          ? 'Guardando...'
                          : 'Guardar empresa'}
                      </button>

                      <button
                        type="button"
                        className="secondary"
                        onClick={
                          handleCancelCreateCompany
                        }
                        disabled={companyCreateSaving}
                      >
                        Cancelar
                      </button>

                    </div>

                  </form>

                </div>
              )}

              {companiesLoading && (
                <p className="muted">
                  Cargando empresas...
                </p>
              )}

              {!companiesLoading &&
                companiesError && (
                  <p className="error">
                    {companiesError}
                  </p>
                )}

              {!companiesLoading &&
                !companiesError &&
                companies.length === 0 && (
                  <div className="empty-state">

                    <strong>
                      No hay empresas
                    </strong>

                    <p>
                      No se encontraron empresas
                      en el sistema.
                    </p>

                  </div>
                )}

              {!companiesLoading &&
                companies.length > 0 && (
                  <div className="contract-list">

                    {companies.map((company) => (
                      <article
                        className="contract-card"
                        key={company.id}
                      >

                        <div className="contract-info">

                          <div>
                            <span>
                              Empresa
                            </span>

                            <strong>
                              {company.name}
                            </strong>
                          </div>

                          <div>
                            <span>
                              CIF / NIF
                            </span>

                            <strong>
                              {company.tax_id}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Direccion
                            </span>

                            <strong>
                              {company.address}
                            </strong>
                          </div>

                        </div>

                        <div className="contract-document">

                          <button
                            type="button"
                            className="download-button"
                            onClick={() =>
                              handleEnterCompany(
                                company,
                              )
                            }
                          >
                            Entrar
                          </button>

                        </div>

                      </article>
                    ))}

                  </div>
                )}

            </div>
          )}

          {/* ================================================= */}
          {/* FICHA DE EMPRESA */}
          {/* ================================================= */}

          {companyView === 'company' &&
            selectedCompany && (
              <div className="contracts">

                <div className="section-header">

                  <div>
                    <p className="eyebrow">
                      Empresa
                    </p>

                    <h2>
                      {selectedCompany.name}
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="secondary"
                    onClick={
                      handleBackToCompanies
                    }
                  >
                    Volver
                  </button>

                </div>

                <div className="profile">

                  <div className="profile-grid">

                    <div>
                      <span>
                        Nombre
                      </span>

                      <strong>
                        {selectedCompany.name}
                      </strong>
                    </div>

                    <div>
                      <span>
                        CIF / NIF
                      </span>

                      <strong>
                        {selectedCompany.tax_id}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Direccion
                      </span>

                      <strong>
                        {selectedCompany.address}
                      </strong>
                    </div>

                  </div>

                  <div className="contract-document">

                    <button
                      type="button"
                      onClick={() =>
                        handleEditCompany(
                          selectedCompany,
                        )
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleEnterEmployees
                      }
                    >
                      Empleados
                    </button>

                  </div>

                </div>

                {/* EDITAR EMPRESA */}

                {editingCompany && (
                  <div className="profile">

                    <div className="section-header">
                      <div>
                        <p className="eyebrow">
                          Gestion de empresas
                        </p>

                        <h2>
                          Editar empresa
                        </h2>
                      </div>
                    </div>

                    <form
                      onSubmit={
                        handleUpdateCompany
                      }
                    >

                      <label htmlFor="company-name">
                        Nombre
                      </label>

                      <input
                        id="company-name"
                        type="text"
                        value={
                          companyForm.name
                        }
                        onChange={(event) =>
                          setCompanyForm({
                            ...companyForm,
                            name:
                              event.target
                                .value,
                          })
                        }
                        required
                      />

                      <label htmlFor="company-tax-id">
                        CIF / NIF
                      </label>

                      <input
                        id="company-tax-id"
                        type="text"
                        value={
                          companyForm.tax_id
                        }
                        onChange={(event) =>
                          setCompanyForm({
                            ...companyForm,
                            tax_id:
                              event.target
                                .value,
                          })
                        }
                        required
                      />

                      <label htmlFor="company-address">
                        Direccion
                      </label>

                      <input
                        id="company-address"
                        type="text"
                        value={
                          companyForm.address
                        }
                        onChange={(event) =>
                          setCompanyForm({
                            ...companyForm,
                            address:
                              event.target
                                .value,
                          })
                        }
                        required
                      />

                      {companiesError && (
                        <p className="error">
                          {companiesError}
                        </p>
                      )}

                      <div className="contract-document">

                        <button
                          type="submit"
                          disabled={
                            companySaving
                          }
                        >
                          {companySaving
                            ? 'Guardando...'
                            : 'Guardar cambios'}
                        </button>

                        <button
                          type="button"
                          className="secondary"
                          onClick={
                            handleCancelEditCompany
                          }
                          disabled={
                            companySaving
                          }
                        >
                          Cancelar
                        </button>

                      </div>

                    </form>

                  </div>
                )}

              </div>
            )}

          {/* ================================================= */}
          {/* EMPLEADOS DE EMPRESA */}
          {/* ================================================= */}

          {companyView === 'employees' &&
            selectedCompany && (
              <div className="contracts">

                <div className="section-header">

                  <div>
                    <p className="eyebrow">
                      {selectedCompany.name}
                    </p>

                    <h2>
                      Empleados
                    </h2>
                  </div>

                  <div className="contract-document">

                    <button
                      type="button"
                      onClick={handleAddEmployee}
                    >
                      Añadir empleado
                    </button>

                    <button
                      type="button"
                      className="secondary"
                      onClick={
                        handleBackToCompany
                      }
                    >
                      Volver a empresa
                    </button>

                  </div>

                </div>

                <div className="profile">
                  <p>
                    Empleados de{' '}
                    <strong>
                      {selectedCompany.name}
                    </strong>
                  </p>
                </div>

                {/* ================================================= */}
                {/* FORMULARIO AÑADIR EMPLEADO */}
                {/* ================================================= */}

                {creatingEmployee && (
                  <div className="profile">

                    <div className="section-header">

                      <div>
                        <p className="eyebrow">
                          Gestion de empleados
                        </p>

                        <h2>
                          Añadir empleado
                        </h2>
                      </div>

                    </div>

                    <form
                      onSubmit={
                        handleCreateEmployee
                      }
                    >

                      <label htmlFor="new-employee-first-name">
                        Nombre
                      </label>

                      <input
                        id="new-employee-first-name"
                        type="text"
                        value={
                          newEmployeeForm.first_name
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            first_name:
                              event.target.value,
                          })
                        }
                        required
                      />

                      <label htmlFor="new-employee-last-name">
                        Apellidos
                      </label>

                      <input
                        id="new-employee-last-name"
                        type="text"
                        value={
                          newEmployeeForm.last_name
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            last_name:
                              event.target.value,
                          })
                        }
                        required
                      />

                      <label htmlFor="new-employee-national-id">
                        DNI / NIE
                      </label>

                      <input
                        id="new-employee-national-id"
                        type="text"
                        value={
                          newEmployeeForm.national_id
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            national_id:
                              event.target.value,
                          })
                        }
                        required
                      />

                      <label htmlFor="new-employee-nationality">
                        Nacionalidad
                      </label>

                      <input
                        id="new-employee-nationality"
                        type="text"
                        value={
                          newEmployeeForm.nationality
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            nationality:
                              event.target.value,
                          })
                        }
                        required
                      />

                      <label htmlFor="new-employee-gender">
                        Genero
                      </label>

                      <input
                        id="new-employee-gender"
                        type="text"
                        value={
                          newEmployeeForm.gender
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            gender:
                              event.target.value,
                          })
                        }
                        required
                      />

                      <label htmlFor="new-employee-birth-date">
                        Fecha de nacimiento
                      </label>

                      <input
                        id="new-employee-birth-date"
                        type="date"
                        value={
                          newEmployeeForm.birth_date
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            birth_date:
                              event.target.value,
                          })
                        }
                        required
                      />

                      <label htmlFor="new-employee-address">
                        Direccion
                      </label>

                      <input
                        id="new-employee-address"
                        type="text"
                        value={
                          newEmployeeForm.address
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            address:
                              event.target.value,
                          })
                        }
                        required
                      />

                      <label htmlFor="new-employee-job-category">
                        Categoria
                      </label>

                      <input
                        id="new-employee-job-category"
                        type="text"
                        value={
                          newEmployeeForm.job_category
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            job_category:
                              event.target.value,
                          })
                        }
                        required
                      />

                      <label htmlFor="new-employee-job-title">
                        Puesto
                      </label>

                      <input
                        id="new-employee-job-title"
                        type="text"
                        value={
                          newEmployeeForm.job_title
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            job_title:
                              event.target.value,
                          })
                        }
                        required
                      />

                      <label htmlFor="new-employee-seniority-date">
                        Fecha de antiguedad
                      </label>

                      <input
                        id="new-employee-seniority-date"
                        type="date"
                        value={
                          newEmployeeForm.seniority_date
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            seniority_date:
                              event.target.value,
                          })
                        }
                        required
                      />

                      <label htmlFor="new-employee-social-security">
                        Numero de Seguridad Social
                      </label>

                      <input
                        id="new-employee-social-security"
                        type="text"
                        value={
                          newEmployeeForm.social_security_number
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            social_security_number:
                              event.target.value,
                          })
                        }
                        required
                      />

                      <label htmlFor="new-employee-username">
                        Usuario
                      </label>

                      <input
                        id="new-employee-username"
                        type="text"
                        value={
                          newEmployeeForm.username
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            username:
                              event.target.value,
                          })
                        }
                        required
                      />

                      <label htmlFor="new-employee-password">
                        Contraseña inicial
                      </label>

                      <input
                        id="new-employee-password"
                        type="password"
                        value={
                          newEmployeeForm.password
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            password:
                              event.target.value,
                          })
                        }
                        minLength={6}
                        required
                      />

                      {employeeCreateError && (
                        <p className="error">
                          {employeeCreateError}
                        </p>
                      )}

                      <div className="contract-document">

                        <button
                          type="submit"
                          disabled={
                            employeeCreateSaving
                          }
                        >
                          {employeeCreateSaving
                            ? 'Guardando...'
                            : 'Guardar empleado'}
                        </button>

                        <button
                          type="button"
                          className="secondary"
                          onClick={
                            handleCancelCreateEmployee
                          }
                          disabled={
                            employeeCreateSaving
                          }
                        >
                          Cancelar
                        </button>

                      </div>

                    </form>

                  </div>
                )}

                {employeesLoading && (
                  <p className="muted">
                    Cargando empleados...
                  </p>
                )}

                {!employeesLoading &&
                  employeesError && (
                    <p className="error">
                      {employeesError}
                    </p>
                  )}

                {!employeesLoading &&
                  !employeesError &&
                  getEmployeesForSelectedCompany().length === 0 && (
                    <div className="empty-state">

                      <strong>
                        No hay empleados
                      </strong>

                      <p>
                        No se encontraron empleados
                        en el sistema.
                      </p>

                    </div>
                  )}

                {!employeesLoading &&
                  getEmployeesForSelectedCompany().length > 0 && (
                    <div className="contract-list">

                      {getEmployeesForSelectedCompany().map(
                        (employee) => (
                          <article
                            className="contract-card"
                            key={employee.id}
                          >

                            <div className="contract-info">

                              <div>
                                <span>
                                  Nombre
                                </span>

                                <strong>
                                  {
                                    employee.first_name
                                  }{' '}
                                  {
                                    employee.last_name
                                  }
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Puesto
                                </span>

                                <strong>
                                  {
                                    employee.job_title ||
                                    'Sin puesto'
                                  }
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Categoria
                                </span>

                                <strong>
                                  {
                                    employee.job_category ||
                                    'Sin categoria'
                                  }
                                </strong>
                              </div>

                            </div>

                            <div className="contract-document">

                              <button
                                type="button"
                                className="download-button"
                                onClick={() =>
                                  handleEnterEmployee(
                                    employee,
                                  )
                                }
                              >
                                Entrar
                              </button>

                            </div>

                          </article>
                        ),
                      )}

                    </div>
                  )}

              </div>
            )}

          {/* ================================================= */}
          {/* FICHA DEL EMPLEADO */}
          {/* ================================================= */}

          {companyView === 'employee' &&
            selectedEmployee && (
              <div className="contracts">

                <div className="section-header">

                  <div>
                    <p className="eyebrow">
                      Empleado
                    </p>

                    <h2>
                      {
                        selectedEmployee.first_name
                      }{' '}
                      {
                        selectedEmployee.last_name
                      }
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="secondary"
                    onClick={
                      handleBackToEmployees
                    }
                  >
                    Volver
                  </button>

                </div>

                <div className="profile">

                  <div className="profile-grid">

                    <div>
                      <span>
                        Nombre
                      </span>

                      <strong>
                        {
                          selectedEmployee.first_name
                        }{' '}
                        {
                          selectedEmployee.last_name
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Puesto
                      </span>

                      <strong>
                        {
                          selectedEmployee.job_title ||
                          'Sin puesto'
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Categoria
                      </span>

                      <strong>
                        {
                          selectedEmployee.job_category ||
                          'Sin categoria'
                        }
                      </strong>
                    </div>

                  </div>

                  <div className="contract-document">

                    <button
                      type="button"
                      onClick={() =>
                        handleEditEmployee(
                          selectedEmployee,
                        )
                      }
                    >
                      Editar empleado
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleViewContracts(
                          selectedEmployee,
                        )
                      }
                    >
                      Contratos
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleViewNominas(
                          selectedEmployee,
                        )
                      }
                    >
                      Nóminas
                    </button>

                  </div>

                </div>

                {/* EDITAR EMPLEADO */}

                {editingEmployee && (
                  <div className="profile">

                    <div className="section-header">

                      <div>
                        <p className="eyebrow">
                          Gestion de empleados
                        </p>

                        <h2>
                          Editar empleado
                        </h2>
                      </div>

                    </div>

                    <form
                      onSubmit={
                        handleUpdateEmployee
                      }
                    >

                      <label htmlFor="employee-first-name">
                        Nombre
                      </label>

                      <input
                        id="employee-first-name"
                        type="text"
                        value={
                          employeeForm.first_name
                        }
                        onChange={(event) =>
                          setEmployeeForm({
                            ...employeeForm,
                            first_name:
                              event.target
                                .value,
                          })
                        }
                        required
                      />

                      <label htmlFor="employee-last-name">
                        Apellidos
                      </label>

                      <input
                        id="employee-last-name"
                        type="text"
                        value={
                          employeeForm.last_name
                        }
                        onChange={(event) =>
                          setEmployeeForm({
                            ...employeeForm,
                            last_name:
                              event.target
                                .value,
                          })
                        }
                        required
                      />

                      <label htmlFor="employee-username">
                        Usuario
                      </label>

                      <input
                        id="employee-username"
                        type="text"
                        value={
                          employeeForm.username
                        }
                        onChange={(event) =>
                          setEmployeeForm({
                            ...employeeForm,
                            username:
                              event.target
                                .value,
                          })
                        }
                        required
                      />

                      <label htmlFor="employee-job-title">
                        Puesto
                      </label>

                      <input
                        id="employee-job-title"
                        type="text"
                        value={
                          employeeForm.job_title
                        }
                        onChange={(event) =>
                          setEmployeeForm({
                            ...employeeForm,
                            job_title:
                              event.target
                                .value,
                          })
                        }
                      />

                      <label htmlFor="employee-job-category">
                        Categoria
                      </label>

                      <input
                        id="employee-job-category"
                        type="text"
                        value={
                          employeeForm.job_category
                        }
                        onChange={(event) =>
                          setEmployeeForm({
                            ...employeeForm,
                            job_category:
                              event.target
                                .value,
                          })
                        }
                      />

                      <label htmlFor="employee-nationality">
                        Nacionalidad
                      </label>

                      <input
                        id="employee-nationality"
                        type="text"
                        value={
                          employeeForm.nationality
                        }
                        onChange={(event) =>
                          setEmployeeForm({
                            ...employeeForm,
                            nationality:
                              event.target
                                .value,
                          })
                        }
                      />

                      {employeeEditError && (
                        <p className="error">
                          {employeeEditError}
                        </p>
                      )}

                      <div className="contract-document">

                        <button
                          type="submit"
                          disabled={
                            employeeSaving
                          }
                        >
                          {employeeSaving
                            ? 'Guardando...'
                            : 'Guardar cambios'}
                        </button>

                        <button
                          type="button"
                          className="secondary"
                          onClick={
                            handleCancelEditEmployee
                          }
                          disabled={
                            employeeSaving
                          }
                        >
                          Cancelar
                        </button>

                      </div>

                    </form>

                  </div>
                )}

              </div>
            )}

          {/* ================================================= */}
          {/* MENU DE CONTRATOS */}
          {/* ================================================= */}

          {companyView === 'employeeContracts' &&
            selectedEmployee && (
              <div className="contracts">

                <div className="section-header">

                  <div>
                    <p className="eyebrow">
                      Documentacion laboral
                    </p>

                    <h2>
                      Contratos de{' '}
                      {
                        selectedEmployee.first_name
                      }{' '}
                      {
                        selectedEmployee.last_name
                      }
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="secondary"
                    onClick={
                      handleBackToEmployee
                    }
                  >
                    Volver
                  </button>

                </div>

                <div className="profile">

                  <div className="profile-grid">

                    <div>
                      <span>
                        Gestion
                      </span>

                      <strong>
                        Contratos
                      </strong>
                    </div>

                    <div>
                      <span>
                        Empleado
                      </span>

                      <strong>
                        {
                          selectedEmployee.first_name
                        }{' '}
                        {
                          selectedEmployee.last_name
                        }
                      </strong>
                    </div>

                  </div>

                  <div className="contract-document">

                    <button
                      type="button"
                      onClick={
                        handleAddContracts
                      }
                    >
                      Añadir contratos
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleContractStore
                      }
                    >
                      Almacén de contratos
                    </button>

                  </div>

                </div>

              </div>
            )}

          {/* ================================================= */}
          {/* ALMACEN DE CONTRATOS */}
          {/* ================================================= */}

          {companyView === 'employeeContractStore' &&
            selectedEmployee && (
              <div className="contracts">

                <div className="section-header">

                  <div>
                    <p className="eyebrow">
                      Almacén de contratos
                    </p>

                    <h2>
                      Contratos almacenados
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="secondary"
                    onClick={
                      handleBackToContractsMenu
                    }
                  >
                    Volver
                  </button>

                </div>

                {contractsLoading && (
                  <p className="muted">
                    Cargando contratos...
                  </p>
                )}

                {!contractsLoading &&
                  contractsError && (
                    <p className="error">
                      {contractsError}
                    </p>
                  )}

                {!contractsLoading &&
                  !contractsError &&
                  contracts.filter(
                    (contract) =>
                      contract.document_path,
                  ).length === 0 && (
                    <div className="empty-state">

                      <strong>
                        No hay documentos almacenados
                      </strong>

                      <p>
                        Todavía no hay contratos con
                        documentos disponibles.
                      </p>

                    </div>
                  )}

                {!contractsLoading &&
                  contracts.length > 0 && (
                    <div className="contract-list">

                      {contracts
                        .filter(
                          (contract) =>
                            contract.document_path,
                        )
                        .map(
                          (contract) => (
                            <article
                              className="contract-card"
                              key={contract.id}
                            >

                              <div className="contract-info">

                                <div>
                                  <span>
                                    Tipo de contrato
                                  </span>

                                  <strong>
                                    {
                                      contract.contract_type
                                    }
                                  </strong>
                                </div>

                                <div>
                                  <span>
                                    Inicio
                                  </span>

                                  <strong>
                                    {formatDate(
                                      contract.start_date,
                                    )}
                                  </strong>
                                </div>

                                <div>
                                  <span>
                                    Documento
                                  </span>

                                  <strong>
                                    {getDocumentName(
                                      contract,
                                    )}
                                  </strong>
                                </div>

                              </div>

                              <div className="contract-document">

                                <button
                                  type="button"
                                  className="download-button"
                                  onClick={() =>
                                    handleDownload(
                                      contract,
                                      selectedEmployee.id,
                                    )
                                  }
                                >
                                  Descargar
                                </button>

                              </div>

                            </article>
                          ),
                        )}

                    </div>
                  )}

              </div>
            )}
                      {/* ================================================= */}
          {/* MENU DE NOMINAS */}
          {/* ================================================= */}

          {companyView === 'employeeNominas' &&
            selectedEmployee && (
              <div className="contracts">

                <div className="section-header">

                  <div>
                    <p className="eyebrow">
                      Documentacion laboral
                    </p>

                    <h2>
                      Nóminas de{' '}
                      {
                        selectedEmployee.first_name
                      }{' '}
                      {
                        selectedEmployee.last_name
                      }
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="secondary"
                    onClick={
                      handleBackToEmployee
                    }
                  >
                    Volver
                  </button>

                </div>

                <div className="profile">

                  <div className="profile-grid">

                    <div>
                      <span>
                        Gestion
                      </span>

                      <strong>
                        Nóminas
                      </strong>
                    </div>

                    <div>
                      <span>
                        Empleado
                      </span>

                      <strong>
                        {
                          selectedEmployee.first_name
                        }{' '}
                        {
                          selectedEmployee.last_name
                        }
                      </strong>
                    </div>

                  </div>

                  <div className="contract-document">

                    <button
                      type="button"
                      onClick={
                        handleAddNominas
                      }
                    >
                      Añadir nóminas
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleNominaStore
                      }
                    >
                      Almacén de nóminas
                    </button>

                  </div>

                </div>

              </div>
            )}

          {/* ================================================= */}
          {/* ALMACEN DE NOMINAS */}
          {/* ================================================= */}

          {companyView === 'employeeNominaStore' &&
            selectedEmployee && (
              <div className="contracts">

                <div className="section-header">

                  <div>
                    <p className="eyebrow">
                      Almacén de nóminas
                    </p>

                    <h2>
                      Nóminas almacenadas
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="secondary"
                    onClick={
                      handleBackToNominasMenu
                    }
                  >
                    Volver
                  </button>

                </div>

                {nominasLoading && (
                  <p className="muted">
                    Cargando nominas...
                  </p>
                )}

                {!nominasLoading &&
                  nominasError && (
                    <p className="error">
                      {nominasError}
                    </p>
                  )}

                {!nominasLoading &&
                  !nominasError &&
                  nominas.filter(
                    (nomina) =>
                      nomina.document_path,
                  ).length === 0 && (
                    <div className="empty-state">

                      <strong>
                        No hay documentos almacenados
                      </strong>

                      <p>
                        Todavía no hay nóminas con
                        documentos disponibles.
                      </p>

                    </div>
                  )}

                {!nominasLoading &&
                  nominas.length > 0 && (
                    <div className="contract-list">

                      {nominas
                        .filter(
                          (nomina) =>
                            nomina.document_path,
                        )
                        .map(
                          (nomina) => (
                            <article
                              className="contract-card"
                              key={nomina.id}
                            >

                              <div className="contract-info">

                                <div>
                                  <span>
                                    Fecha
                                  </span>

                                  <strong>
                                    {formatDate(
                                      nomina.date,
                                    )}
                                  </strong>
                                </div>

                                <div>
                                  <span>
                                    Documento
                                  </span>

                                  <strong>
                                    {getNominaDocumentName(
                                      nomina,
                                    )}
                                  </strong>
                                </div>

                              </div>

                              <div className="contract-document">

                                <button
                                  type="button"
                                  className="download-button"
                                  onClick={() =>
                                    handleDownloadNomina(
                                      nomina,
                                      selectedEmployee.id,
                                    )
                                  }
                                >
                                  Descargar
                                </button>

                              </div>

                            </article>
                          ),
                        )}

                    </div>
                  )}

              </div>
            )}

          </section>
        </div>
      </main>
    )
  }

  // =========================================================
  // PORTAL EMPLEADO
  // =========================================================

  if (loggedIn && user) {
    return (
      <main className="app">
        <section className="card">

          <div className="header">

            <div>
              <p className="eyebrow">
                Portal Laboraltus
              </p>

              <h1>
                Bienvenido, {user.first_name}
              </h1>
            </div>

            <button
              type="button"
              className="secondary"
              onClick={handleLogout}
            >
              Cerrar sesion
            </button>

          </div>

          {/* PERFIL */}

          <div className="profile">

            <h2>
              Mi perfil
            </h2>

            <div className="profile-grid">

              <div>
                <span>
                  Nombre
                </span>

                <strong>
                  {user.first_name}{' '}
                  {user.last_name}
                </strong>
              </div>

              <div>
                <span>
                  Usuario
                </span>

                <strong>
                  {user.username}
                </strong>
              </div>

              <div>
                <span>
                  Rol
                </span>

                <strong>
                  {user.role}
                </strong>
              </div>

              <div>
                <span>
                  Puesto
                </span>

                <strong>
                  {user.job_title}
                </strong>
              </div>

              <div>
                <span>
                  Categoria
                </span>

                <strong>
                  {user.job_category}
                </strong>
              </div>

              <div>
                <span>
                  Nacionalidad
                </span>

                <strong>
                  {user.nationality}
                </strong>
              </div>

            </div>

          </div>

          {/* CONTRATOS */}

          <div className="contracts">

            <div className="section-header">

              <div>
                <p className="eyebrow">
                  Documentacion laboral
                </p>

                <h2>
                  Mis contratos
                </h2>
              </div>

              {!contractsLoading &&
                contracts.length > 0 && (
                  <span className="contract-count">
                    {contracts.length}{' '}
                    {contracts.length === 1
                      ? 'contrato'
                      : 'contratos'}
                  </span>
                )}

            </div>

            {contractsLoading && (
              <p className="muted">
                Cargando contratos...
              </p>
            )}

            {!contractsLoading &&
              contractsError && (
                <p className="error">
                  {contractsError}
                </p>
              )}

            {!contractsLoading &&
              !contractsError &&
              contracts.length === 0 && (
                <div className="empty-state">

                  <strong>
                    No hay contratos disponibles
                  </strong>

                  <p>
                    Todavia no hay contratos
                    asociados a tu perfil.
                  </p>

                </div>
              )}

            {!contractsLoading &&
              contracts.length > 0 && (
                <div className="contract-list">

                  {contracts.map(
                    (contract) => (
                      <article
                        className="contract-card"
                        key={contract.id}
                      >

                        <div className="contract-info">

                          <div>
                            <span>
                              Tipo de contrato
                            </span>

                            <strong>
                              {
                                contract.contract_type
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              Inicio
                            </span>

                            <strong>
                              {formatDate(
                                contract.start_date,
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Fin
                            </span>

                            <strong>
                              {contract.end_date
                                ? formatDate(
                                    contract.end_date,
                                  )
                                : 'Indefinido'}
                            </strong>
                          </div>

                        </div>

                        <div className="contract-document">

                          {contract.document_path ? (
                            <button
                              type="button"
                              className="download-button"
                              onClick={() =>
                                handleDownload(
                                  contract,
                                )
                              }
                            >
                              Descargar documento
                            </button>
                          ) : (
                            <span className="no-document">
                              Documento no disponible
                            </span>
                          )}

                        </div>

                      </article>
                    ),
                  )}

                </div>
              )}

          </div>

          {/* NOMINAS */}

          <div className="contracts">

            <div className="section-header">

              <div>
                <p className="eyebrow">
                  Documentacion laboral
                </p>

                <h2>
                  Mis nominas
                </h2>
              </div>

              {!nominasLoading &&
                nominas.length > 0 && (
                  <span className="contract-count">
                    {nominas.length}{' '}
                    {nominas.length === 1
                      ? 'nomina'
                      : 'nominas'}
                  </span>
                )}

            </div>

            {nominasLoading && (
              <p className="muted">
                Cargando nominas...
              </p>
            )}

            {!nominasLoading &&
              nominasError && (
                <p className="error">
                  {nominasError}
                </p>
              )}

            {!nominasLoading &&
              !nominasError &&
              nominas.length === 0 && (
                <div className="empty-state">

                  <strong>
                    No hay nominas disponibles
                  </strong>

                  <p>
                    Todavia no hay nominas
                    asociadas a tu perfil.
                  </p>

                </div>
              )}

            {!nominasLoading &&
              nominas.length > 0 && (
                <div className="contract-list">

                  {nominas.map(
                    (nomina) => (
                      <article
                        className="contract-card"
                        key={nomina.id}
                      >

                        <div className="contract-info">

                          <div>
                            <span>
                              Fecha
                            </span>

                            <strong>
                              {formatDate(
                                nomina.date,
                              )}
                            </strong>
                          </div>

                        </div>

                        <div className="contract-document">

                          {nomina.document_path ? (
                            <button
                              type="button"
                              className="download-button"
                              onClick={() =>
                                handleDownloadNomina(
                                  nomina,
                                )
                              }
                            >
                              Descargar documento
                            </button>
                          ) : (
                            <span className="no-document">
                              Documento no disponible
                            </span>
                          )}

                        </div>

                      </article>
                    ),
                  )}

                </div>
              )}

          </div>

        </section>
      </main>
    )
  }

  // =========================================================
  // LOGIN
  // =========================================================

  return (
    <main className="app">

      <section className="login-card">

        <div className="login-header">

          <p className="eyebrow">
            Portal Laboraltus
          </p>

          <h1>
            Portal del empleado
          </h1>

          <p>
            Inicia sesion para acceder a tu
            informacion.
          </p>

        </div>

        <form onSubmit={handleLogin}>

          <label htmlFor="username">
            Usuario
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            placeholder="Introduce tu usuario"
            autoComplete="username"
            required
          />

          <label htmlFor="password">
            Contrasena
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Introduce tu contrasena"
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Iniciando sesion...'
              : 'Iniciar sesion'}
          </button>

        </form>

      </section>

    </main>
  )
}

export default App