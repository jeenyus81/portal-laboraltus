import { useEffect, useRef, useState } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 30000)

    return () => clearInterval(timer)
  }, [])

  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  // =========================================================
  // INPUTS DE ARCHIVOS DIRECTOS
  // =========================================================

  const contractFileInputRef = useRef(null)
  const nominaFileInputRef = useRef(null)
  const companyLogoFileInputRef = useRef(null)
  const companyNominaFileInputRef = useRef(null)
  const companyNominaPanelFileInputRef = useRef(null)
  const companyNominaPanelTargetRef = useRef(null)
  const companyContractPanelFileInputRef = useRef(null)
  const companyContractPanelTargetRef = useRef(null)

  // =========================================================
  // EMPRESAS
  // =========================================================

  const [companies, setCompanies] = useState([])
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [companiesError, setCompaniesError] = useState('')

  const [recentActivities, setRecentActivities] = useState([])
  const [recentActivitiesLoading, setRecentActivitiesLoading] = useState(false)
  const [recentActivitiesError, setRecentActivitiesError] = useState('')

  const [selectedCompany, setSelectedCompany] = useState(null)
  const [companyView, setCompanyView] = useState('companies')
  const [activeMenu, setActiveMenu] = useState('companies')

  const [companyForm, setCompanyForm] = useState({
    name: '',
    company_code: '',
    tax_id: '',
    address: '',
    logo: '',
  })

  const [editingCompany, setEditingCompany] = useState(null)
  const [companySaving, setCompanySaving] = useState(false)

  const [creatingCompany, setCreatingCompany] = useState(false)
  const [companyCreateSaving, setCompanyCreateSaving] = useState(false)
  const [companyCreateError, setCompanyCreateError] = useState('')

  const companyNominaFilesRef = useRef([])
  const companyContractFilesRef = useRef([])

  // =========================================================
  // EMPLEADOS
  // =========================================================

  const [employees, setEmployees] = useState([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [employeesError, setEmployeesError] = useState('')

  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employeeListMode, setEmployeeListMode] = useState('company')
  const [employeePortalView, setEmployeePortalView] = useState('dashboard')
  const [employeeActiveMenu, setEmployeeActiveMenu] = useState('dashboard')
  const [downloadedContractIds, setDownloadedContractIds] = useState([])
  const [downloadedNominaIds, setDownloadedNominaIds] = useState([])

  // =========================================================
  // EDICION DE EMPLEADO
  // =========================================================

  const [editingEmployee, setEditingEmployee] = useState(null)

  const [employeeForm, setEmployeeForm] = useState({
    first_name: '',
    last_name: '',
    employee_code: '',
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
    employee_code: '',
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
      employee_code: '',
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
            employee_code: newEmployeeForm.employee_code,
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
        employee_code: '',
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
  // CONTRATOS DESCARGADOS POR EL EMPLEADO
  // =========================================================

  async function loadDownloadedContracts(employeeId, token) {
    if (!employeeId || !token) {
      setDownloadedContractIds([])
      return
    }

    try {
      const response = await fetch(
        API_URL +
          '/api/employees/' +
          employeeId +
          '/contracts/downloaded',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setDownloadedContractIds([])
        return
      }

      setDownloadedContractIds(
        Array.isArray(data?.contract_ids)
          ? data.contract_ids
          : [],
      )
    } catch {
      setDownloadedContractIds([])
    }
  }

  async function markContractAsDownloaded(employeeId, contractId) {
    const token = localStorage.getItem('access_token')

    if (!token || !employeeId || !contractId) {
      return false
    }

    try {
      const response = await fetch(
        API_URL +
          '/api/employees/' +
          employeeId +
          '/contracts/' +
          contractId +
          '/downloaded',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const data = await response.json().catch(() => null)

      if (!response.ok || data?.downloaded !== true) {
        return false
      }

      setDownloadedContractIds((previous) =>
        previous.includes(contractId)
          ? previous
          : [...previous, contractId],
      )

      return true
    } catch {
      return false
    }
  }

  // =========================================================
  // NÓMINAS DESCARGADAS POR EL EMPLEADO
  // =========================================================

  async function loadDownloadedNominas(employeeId, token) {
    if (!employeeId || !token) {
      setDownloadedNominaIds([])
      return
    }

    try {
      const response = await fetch(
        API_URL +
          '/api/employees/' +
          employeeId +
          '/nominas/downloaded',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setDownloadedNominaIds([])
        return
      }

      setDownloadedNominaIds(
        Array.isArray(data?.nomina_ids)
          ? data.nomina_ids
          : [],
      )
    } catch {
      setDownloadedNominaIds([])
    }
  }

  async function markNominaAsDownloaded(employeeId, nominaId) {
    const token = localStorage.getItem('access_token')

    if (!token || !employeeId || !nominaId) {
      return false
    }

    try {
      const response = await fetch(
        API_URL +
          '/api/employees/' +
          employeeId +
          '/nominas/' +
          nominaId +
          '/downloaded',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const data = await response.json().catch(() => null)

      if (!response.ok || data?.downloaded !== true) {
        return false
      }

      setDownloadedNominaIds((previous) =>
        previous.includes(nominaId)
          ? previous
          : [...previous, nominaId],
      )

      return true
    } catch {
      return false
    }
  }

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

  const COMPANY_LOGOS_STORAGE_KEY =
    'laboraltus_company_logos'

  function readCompanyLogos() {
    try {
      const stored =
        localStorage.getItem(
          COMPANY_LOGOS_STORAGE_KEY,
        )
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  function getStoredCompanyLogo(companyId) {
    if (!companyId) {
      return ''
    }

    const logos = readCompanyLogos()
    return logos[String(companyId)] || ''
  }

  function saveStoredCompanyLogo(
    companyId,
    logoData,
  ) {
    if (!companyId) {
      return
    }

    const logos = readCompanyLogos()
    const key = String(companyId)

    if (logoData) {
      logos[key] = logoData
    } else {
      delete logos[key]
    }

    localStorage.setItem(
      COMPANY_LOGOS_STORAGE_KEY,
      JSON.stringify(logos),
    )
  }

  function addStoredLogoToCompany(company) {
    if (!company) {
      return company
    }

    return {
      ...company,
      logo:
        company.logo ||
        getStoredCompanyLogo(company.id),
    }
  }

  async function loadBackendCompanyLogo(
    companyId,
    token,
  ) {
    if (!companyId || !token) {
      return ''
    }

    try {
      const response = await fetch(
        API_URL +
          '/api/companies/' +
          companyId +
          '/logo',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      if (response.status === 404) {
        return ''
      }

      const data = await response.json()

      if (!response.ok) {
        return ''
      }

      return data?.logo || ''
    } catch {
      return ''
    }
  }

  async function loadEmployeeCompanyLogo(companyId, token) {
    if (!companyId || !token) {
      return ''
    }

    try {
      const response = await fetch(
        API_URL + '/api/companies/' + companyId + '/logo',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      if (!response.ok) {
        return ''
      }

      const data = await response.json()
      return data?.logo || ''
    } catch {
      return ''
    }
  }

  async function saveCompanyLogoToBackend(
    companyId,
    logoData,
    token,
  ) {
    if (!companyId || !token) {
      throw new Error(
        'No se puede guardar el logo sin una sesion valida',
      )
    }

    const url =
      API_URL +
      '/api/companies/' +
      companyId +
      '/logo'

    if (!logoData) {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.detail || 'No se pudo eliminar el logo de la empresa',
        )
      }

      return ''
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        logo: logoData,
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        data?.detail || 'No se pudo guardar el logo de la empresa',
      )
    }

    return data?.logo || logoData
  }

  function handleCompanyLogoChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setCompanyCreateError(
        'El archivo debe ser una imagen',
      )
      setCompaniesError(
        'El archivo debe ser una imagen',
      )
      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return
      }

      setCompanyCreateError('')
      setCompaniesError('')

      setCompanyForm((previous) => ({
        ...previous,
        logo: reader.result,
      }))
    }

    reader.onerror = () => {
      setCompanyCreateError(
        'No se pudo cargar el logo',
      )
      setCompaniesError(
        'No se pudo cargar el logo',
      )
    }

    reader.readAsDataURL(file)
  }

  function handleCompanyNominaFilesChange(event) {
    const files = Array.from(event.target.files || [])
    companyNominaFilesRef.current = files
  }

  function handleCompanyNominaPanelFilesChange(event) {
    const files = Array.from(event.target.files || [])
    companyNominaFilesRef.current = files
    event.target.value = ''
  }

  function handleOpenCompanyNominaUpload(company) {
    companyNominaPanelTargetRef.current = company
    companyNominaFilesRef.current = []

    if (companyNominaPanelFileInputRef.current) {
      companyNominaPanelFileInputRef.current.value = ''
      companyNominaPanelFileInputRef.current.click()
    }
  }

  function handleCompanyContractPanelFilesChange(event) {
    const files = Array.from(event.target.files || [])
    companyContractFilesRef.current = files
    event.target.value = ''
  }

  function handleOpenCompanyContractUpload(company) {
    companyContractPanelTargetRef.current = company
    companyContractFilesRef.current = []

    if (companyContractPanelFileInputRef.current) {
      companyContractPanelFileInputRef.current.value = ''
      companyContractPanelFileInputRef.current.click()
    }
  }

  function handleRemoveCompanyLogo() {
    setCompanyForm((previous) => ({
      ...previous,
      logo: '',
    }))

    if (companyLogoFileInputRef.current) {
      companyLogoFileInputRef.current.value = ''
    }
  }

  // =========================================================
  // CARGAR EMPRESAS
  // =========================================================

  async function loadRecentActivities(token) {
    if (!token) {
      setRecentActivities([])
      return
    }

    setRecentActivitiesLoading(true)
    setRecentActivitiesError('')

    try {
      const response = await fetch(
        API_URL + '/api/activity/recent',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.detail || 'No se pudo cargar la actividad reciente',
        )
      }

      setRecentActivities(Array.isArray(data) ? data : [])
    } catch (err) {
      setRecentActivities([])
      setRecentActivitiesError(err.message)
    } finally {
      setRecentActivitiesLoading(false)
    }
  }

  function formatActivityDateTime(value) {
    if (!value) {
      return ''
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return ''
    }

    return date.toLocaleString(
      'es-ES',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Madrid',
      },
    )
  }

  function handleRecentActivityClick(activity) {
    if (!activity?.target) {
      return
    }

    if (activity.target === 'companies') {
      setActiveMenu('companies')
      setSelectedCompany(null)
      setSelectedEmployee(null)
      setCompanyView('companies')
      return
    }

    if (activity.target === 'employees') {
      handleEnterAllEmployees()
      return
    }

    if (activity.target === 'contracts') {
      setActiveMenu('contracts')
      setCompanyView('contractsBlank')
      return
    }

    if (activity.target === 'nominas') {
      setActiveMenu('nominas')
      setCompanyView('nominasBlank')
    }
  }

  useEffect(() => {
    if (!loggedIn || user?.role !== 'HR' || companyView !== 'dashboard') {
      return
    }

    const token = localStorage.getItem('access_token')

    if (!token) {
      return
    }

    loadRecentActivities(token)
  }, [loggedIn, user?.role, companyView])

  useEffect(() => {
    if (
      !loggedIn ||
      user?.role !== 'EMPLOYEE' ||
      employeePortalView !== 'dashboard'
    ) {
      return
    }

    const token = localStorage.getItem('access_token')

    if (!token) {
      return
    }

    loadRecentActivities(token)
  }, [loggedIn, user?.role, employeePortalView])


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

      const companiesWithLogos =
        Array.isArray(data)
          ? await Promise.all(
              data.map(async (company) => {
                const backendLogo =
                  await loadBackendCompanyLogo(
                    company.id,
                    token,
                  )

                return {
                  ...addStoredLogoToCompany(company),
                  logo:
                    backendLogo ||
                    company.logo ||
                    getStoredCompanyLogo(company.id) ||
                    '',
                }
              }),
            )
          : []

      setCompanies(companiesWithLogos)
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
    setActiveMenu('companies')
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
      company_code: '',
      tax_id: '',
      address: '',
      logo: '',
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
      company_code: '',
      tax_id: '',
      address: '',
      logo: '',
    })
  }

  function handleCancelCreateCompany() {
    setCreatingCompany(false)
    setCompanyCreateError('')

    setCompanyForm({
      name: '',
      company_code: '',
      tax_id: '',
      address: '',
      logo: '',
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
            company_code: companyForm.company_code,
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

      const savedLogo = companyForm.logo
        ? await saveCompanyLogoToBackend(
            data.id,
            companyForm.logo,
            token,
          )
        : ''

      const createdCompany = {
        ...data,
        logo: savedLogo,
      }

      setCompanies((previous) => [
        ...previous,
        createdCompany,
      ])

      setCreatingCompany(false)

      setCompanyForm({
        name: '',
        company_code: '',
        tax_id: '',
        address: '',
        logo: '',
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
      company_code: company.company_code || '',
      tax_id: company.tax_id || '',
      address: company.address || '',
      logo:
        company.logo ||
        getStoredCompanyLogo(company.id) ||
        '',
    })

    setCompaniesError('')
  }

  function handleCancelEditCompany() {
    setEditingCompany(null)

    setCompanyForm({
      name: '',
      company_code: '',
      tax_id: '',
      address: '',
      logo: '',
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
            company_code: companyForm.company_code,
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

      const savedLogo =
        await saveCompanyLogoToBackend(
          data.id,
          companyForm.logo || '',
          token,
        )

      const updatedCompany = {
        ...data,
        logo: savedLogo,
      }

      setCompanies((previous) =>
        previous.map((company) =>
          company.id === data.id
            ? updatedCompany
            : company,
        ),
      )

      setSelectedCompany(updatedCompany)
      setEditingCompany(null)

      setCompanyForm({
        name: '',
        company_code: '',
        tax_id: '',
        address: '',
        logo: '',
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

  function getCompanyForEmployee(employee) {
    if (!employee) {
      return null
    }

    return companies.find(
      (company) => company.id === employee.company_id,
    ) || null
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
  // ENTRAR EN PANEL GENERAL DE EMPLEADOS
  // =========================================================

  async function handleEnterAllEmployees() {
    setActiveMenu('employees')
    setEmployeeListMode('all')
    setSelectedCompany(null)
    setSelectedEmployee(null)
    setCreatingEmployee(false)

    const token = localStorage.getItem('access_token')

    if (!token) {
      setEmployeesError('No hay una sesion valida')
      return
    }

    await loadEmployees(token)
    setCompanyView('employeesAll')
    setContracts([])
    setNominas([])
    setSelectedFiles({})
    setSelectedNominaFiles({})
    companyNominaFilesRef.current = []
    companyContractFilesRef.current = []
  }

  // =========================================================
  // ENTRAR EN EMPLEADOS DE LA EMPRESA
  // =========================================================

  async function handleEnterEmployees() {
    setActiveMenu('employees')
    setEmployeeListMode('company')
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
    setActiveMenu('companies')
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
      employee_code: employee.employee_code || '',
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
      employee_code: '',
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
            employee_code: employeeForm.employee_code,
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
        employee_code: '',
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
    setActiveMenu('employees')
    const employeeCompany = getCompanyForEmployee(employee)
    if (employeeCompany) {
      setSelectedCompany(employeeCompany)
    }
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
    setActiveMenu('contracts')
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
    setActiveMenu('nominas')
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
    setContractsError(
      'No se ha seleccionado ningún empleado',
    )
    return
  }

  if (file.type !== 'application/pdf') {
    setContractsError(
      'El archivo debe ser un PDF',
    )
    return
  }

  const token = localStorage.getItem(
    'access_token',
  )

  if (!token) {
    setContractsError(
      'No hay una sesion valida',
    )
    return
  }

  setContractsError('')

  try {
    const formData = new FormData()

    formData.append(
      'file',
      file,
    )

    const response = await fetch(
      API_URL +
        '/api/employees/' +
        selectedEmployee.id +
        '/contracts/upload',
      {
        method: 'POST',
        headers: {
          Authorization:
            'Bearer ' + token,
        },
        body: formData,
      },
    )

    const data =
      await response
        .json()
        .catch(() => null)

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          'No se pudo guardar el contrato',
      )
    }

    await loadContracts(
      selectedEmployee.id,
      token,
    )
  } catch (err) {
    setContractsError(err.message)
  }
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
    setNominasError(
      'No se ha seleccionado ningún empleado',
    )
    return
  }

  if (file.type !== 'application/pdf') {
    setNominasError(
      'El archivo debe ser un PDF',
    )
    return
  }

  const token = localStorage.getItem(
    'access_token',
  )

  if (!token) {
    setNominasError(
      'No hay una sesion valida',
    )
    return
  }

  setNominasError('')

  try {
    const formData = new FormData()

    formData.append(
      'file',
      file,
    )

    const response = await fetch(
      API_URL +
        '/api/employees/' +
        selectedEmployee.id +
        '/nominas/upload',
      {
        method: 'POST',
        headers: {
          Authorization:
            'Bearer ' + token,
        },
        body: formData,
      },
    )

    const data =
      await response
        .json()
        .catch(() => null)

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          'No se pudo guardar la nómina',
      )
    }

    await loadNominas(
      selectedEmployee.id,
      token,
    )
  } catch (err) {
    setNominasError(err.message)
  }
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
    setActiveMenu('employees')
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
    setActiveMenu('contracts')
    setCompanyView('employeeContracts')
    setEmployeeSection('contracts')

    setSelectedFiles({})
    setContractsError('')
  }

  // =========================================================
  // VOLVER AL MENU DE NOMINAS
  // =========================================================

  function handleBackToNominasMenu() {
    setActiveMenu('nominas')
    setCompanyView('employeeNominas')
    setEmployeeSection('nominas')

    setSelectedNominaFiles({})
    setNominasError('')
  }

  // =========================================================
  // VOLVER A EMPLEADOS
  // =========================================================

  function handleBackToEmployees() {
    setActiveMenu('employees')
    setCompanyView(
      employeeListMode === 'all'
        ? 'employeesAll'
        : 'employees',
    )
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

      if (user?.role === 'EMPLOYEE') {
        await markContractAsDownloaded(
          targetEmployeeId,
          contract.id,
        )
      }
    } catch (err) {
      setContractsError(err.message)
    }
  }

  // =========================================================
  // VER CONTRATO EN ALMACEN
  // =========================================================

  async function handleViewContract(
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

    // Abrimos la pestaña de forma síncrona, antes del await,
    // para evitar que el navegador la bloquee.
    const previewWindow = window.open('', '_blank')

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
            'No se pudo abrir el contrato',
        )
      }

      const blob = await response.blob()

      const viewUrl =
        window.URL.createObjectURL(blob)

      if (previewWindow) {
        previewWindow.location.href = viewUrl
      } else {
        window.open(viewUrl, '_blank')
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(viewUrl)
      }, 60000)
    } catch (err) {
      if (previewWindow) {
        previewWindow.close()
      }

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

      if (user?.role === 'EMPLOYEE') {
        await markNominaAsDownloaded(
          targetEmployeeId,
          nomina.id,
        )
      }
    } catch (err) {
      setNominasError(err.message)
    }
  }


  // =========================================================
  // VER NÓMINA EN ALMACÉN
  // =========================================================

  async function handleViewNomina(
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

    const previewWindow = window.open('', '_blank')

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
            'No se pudo abrir la nómina',
        )
      }

      const blob = await response.blob()

      const viewUrl =
        window.URL.createObjectURL(blob)

      if (previewWindow) {
        previewWindow.location.href = viewUrl
      } else {
        window.open(viewUrl, '_blank')
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(viewUrl)
      }, 60000)
    } catch (err) {
      if (previewWindow) {
        previewWindow.close()
      }

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
  // VOLVER A INICIO
  // =========================================================

  function handleBackToDashboard() {
    setActiveMenu('dashboard')
    setCompanyView('dashboard')
    setSelectedCompany(null)
    setSelectedEmployee(null)
    setEditingCompany(null)
    setCreatingCompany(false)
    setEditingEmployee(null)
    setCreatingEmployee(false)
    setContracts([])
    setNominas([])
    setSelectedFiles({})
    setSelectedNominaFiles({})
    setEmployeesError('')
    setCompaniesError('')
    setContractsError('')
    setNominasError('')
    setEmployeeEditError('')
    setEmployeeCreateError('')
    setCompanyCreateError('')
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

        setActiveMenu('dashboard')
        setCompanyView('dashboard')
        setSelectedCompany(null)
        setSelectedEmployee(null)

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

        const employeeCompanyLogo =
          (await loadEmployeeCompanyLogo(
            me.company_id,
            data.access_token,
          )) ||
          me.company_logo ||
          getStoredCompanyLogo(me.company_id) ||
          ''

        const loggedUser = {
          ...me,
          company_logo: employeeCompanyLogo,
          role: data.role,
          username: username,
        }

        setUser(loggedUser)
        setLoggedIn(true)
        setEmployeePortalView('dashboard')
        setEmployeeActiveMenu('dashboard')

        await loadContracts(
          me.id,
          data.access_token,
        )

        await loadDownloadedContracts(
          me.id,
          data.access_token,
        )

        await loadNominas(
          me.id,
          data.access_token,
        )
        await loadDownloadedNominas(
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
      company_code: '',
      tax_id: '',
      address: '',
      logo: '',
    })

    setEmployeeForm({
      first_name: '',
      last_name: '',
      employee_code: '',
      job_title: '',
      job_category: '',
      nationality: '',
      username: '',
    })

    setNewEmployeeForm({
      first_name: '',
      last_name: '',
      employee_code: '',
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
    setEmployeeListMode('company')
    setActiveMenu('companies')

    setUsername('')
    setPassword('')
    setDownloadedContractIds([])
    setDownloadedNominaIds([])
  }

  // =========================================================
  // PORTAL RRHH
  // =========================================================

if (loggedIn && user && user.role === 'HR') {
  const contextCompanyLogo =
    selectedCompany?.logo ||
    getStoredCompanyLogo(selectedCompany?.id) ||
    ''

  return (
    <main className="app hr-app">
      <aside className="hr-sidebar">

<div
  className="hr-brand"
  style={{
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    minHeight: '185px',
    padding: '16px 10px 20px',
    background: '#f4f3ee',
    borderRadius: '10px',
    marginBottom: '18px',
  }}
>
  <img
    src="/laboraltus-mark.png"
    alt="Logo Laboraltus"
    style={{
      display: 'block',
      width: '72px',
      height: '72px',
      objectFit: 'contain',
    }}
  />
  <img
    src="/laboraltus-wordmark.png"
    alt="Laboraltus"
    style={{
      display: 'block',
      width: '205px',
      maxWidth: '100%',
      height: 'auto',
      objectFit: 'contain',
    }}
  />
</div>

        <nav className="hr-nav">

<button
  type="button"
  className={
    activeMenu === 'dashboard'
      ? 'hr-nav-button active'
      : 'hr-nav-button'
  }
  style={
    activeMenu === 'dashboard'
      ? { background: '#f4f3ee', color: '#172b45' }
      : undefined
  }
  onClick={() => {
    setActiveMenu('dashboard')
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
            className={
              activeMenu === 'companies'
                ? 'hr-nav-button active'
                : 'hr-nav-button'
            }
            style={
              activeMenu === 'companies'
                ? { background: '#f4f3ee', color: '#172b45' }
                : undefined
            }
            onClick={() => {
              setActiveMenu('companies')
              setCompanyView(
                selectedCompany ? 'company' : 'companies'
              )
            }}
          >
            <span className="hr-nav-icon">🏢</span>
            Empresas
          </button>

          <button
            type="button"
            className={
              activeMenu === 'employees'
                ? 'hr-nav-button active'
                : 'hr-nav-button'
            }
            style={
              activeMenu === 'employees'
                ? { background: '#f4f3ee', color: '#172b45' }
                : undefined
            }
            onClick={() => {
              handleEnterAllEmployees()
            }}
          >
            <span className="hr-nav-icon">👥</span>
            Empleados
          </button>

          <button
            type="button"
            className={
              activeMenu === 'contracts'
                ? 'hr-nav-button active'
                : 'hr-nav-button'
            }
            style={
              activeMenu === 'contracts'
                ? { background: '#f4f3ee', color: '#172b45' }
                : undefined
            }
            onClick={() => {
              setActiveMenu('contracts')
              setCompanyView('contractsBlank')
            }}
          >
            <span className="hr-nav-icon">📄</span>
            Contratos
          </button>

          <button
            type="button"
            className={
              activeMenu === 'nominas'
                ? 'hr-nav-button active'
                : 'hr-nav-button'
            }
            style={
              activeMenu === 'nominas'
                ? { background: '#f4f3ee', color: '#172b45' }
                : undefined
            }
            onClick={() => {
              setActiveMenu('nominas')
              setCompanyView('nominasBlank')
            }}
          >
            <span className="hr-nav-icon">💳</span>
            Nóminas
          </button>

        </nav>

        <div className="hr-sidebar-bottom">

          <div className="hr-user-box">
<div className="hr-user-avatar">
  <img
    src="/laboraltus-mark.png"
    alt="Laboraltus"
  />
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
  <div className="hr-shell">

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

<div className="hr-topbar">

  <div className="hr-topbar-title">
    <p className="eyebrow">
      Portal Laboraltus
    </p>

    <h1 className="hr-panel-title">
      Panel de Administración
    </h1>
  </div>

  <div className="hr-topbar-user">

    <div className="hr-topbar-date">
      <span className="hr-topbar-date-icon">
        ▣
      </span>

      <span>
        {currentDateTime.toLocaleDateString(
          'es-ES',
          {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Europe/Madrid',
          },
        )}{' · '}
        {currentDateTime.toLocaleTimeString(
          'es-ES',
          {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Madrid',
          },
        )}
      </span>
    </div>

  </div>

</div>
{/* ================================================= */}
{/* PANEL DE CONTRATOS */}
{/* ================================================= */}

{companyView === 'contractsBlank' && (
  <div className="contracts">

    <div className="section-header">
      <div>
        <p className="eyebrow">
          Gestión de contratos
        </p>

        <h2>
          Contratos
        </h2>
      </div>

      <div className="contract-document">

        <button
          type="button"
          className="hr-company-detail-button"
          style={{
            background: '#f4f3ee',
            color: '#172b45',
            border: '1px solid #f4f3ee',
            boxShadow: 'none',
          }}
          onClick={handleBackToDashboard}
        >
          Volver a Inicio
        </button>

      </div>
    </div>

    <input
      ref={companyContractPanelFileInputRef}
      type="file"
      multiple
      style={{ display: 'none' }}
      onChange={
        handleCompanyContractPanelFilesChange
      }
    />

    {companiesLoading && (
      <p className="muted">
        Cargando empresas...
      </p>
    )}

    {!companiesLoading && companiesError && (
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
              className="contract-card hr-company-card"
              key={company.id}
            >
              <div className="hr-company-row">

                <div className="hr-company-field hr-company-name">
                  <span>
                    Empresa
                  </span>

                  <strong>
                    {company.name}
                  </strong>
                </div>

                <div className="hr-company-logo-slot">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={
                        'Logo de ' +
                        company.name
                      }
                    />
                  ) : (
                    <span>
                      Logotipo
                    </span>
                  )}
                </div>

                <div className="hr-company-field">
                  <span>
                    CIF / NIF
                  </span>

                  <strong>
                    {company.tax_id}
                  </strong>
                </div>

                <div className="hr-company-field hr-company-address">
                  <span>
                    Dirección
                  </span>

                  <strong>
                    {company.address}
                  </strong>
                </div>

                <div className="hr-company-action">
                  <button
                    type="button"
                    className="hr-company-detail-button"
                    style={{
                      background: '#f4f3ee',
                      color: '#172b45',
                      border: '1px solid #f4f3ee',
                      boxShadow: 'none',
                    }}
                    onClick={() =>
                      handleOpenCompanyContractUpload(
                        company,
                      )
                    }
                  >
                    Cargar contratos
                  </button>
                </div>

              </div>
            </article>
          ))}
        </div>
      )}

  </div>
)}

{/* ================================================= */}
{/* PANEL VACÍO DE NÓMINAS */}
{/* ================================================= */}

{companyView === 'nominasBlank' && (
  <div className="contracts">

    <div className="section-header">
      <div>
        <p className="eyebrow">
          Gestión de nóminas
        </p>

        <h2>
          Nóminas
        </h2>
      </div>

      <div className="contract-document">

        <button
          type="button"
          className="hr-company-detail-button"
          style={{
            background: '#f4f3ee',
            color: '#172b45',
            border: '1px solid #f4f3ee',
            boxShadow: 'none',
          }}
          onClick={handleBackToDashboard}
        >
          Volver a Inicio
        </button>

      </div>
    </div>

    <input
      ref={companyNominaPanelFileInputRef}
      type="file"
      multiple
      style={{ display: 'none' }}
      onChange={
        handleCompanyNominaPanelFilesChange
      }
    />

    {companiesLoading && (
      <p className="muted">
        Cargando empresas...
      </p>
    )}

    {!companiesLoading && companiesError && (
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
              className="contract-card hr-company-card"
              key={company.id}
            >
              <div className="hr-company-row">

                <div className="hr-company-field hr-company-name">
                  <span>
                    Empresa
                  </span>

                  <strong>
                    {company.name}
                  </strong>
                </div>

                <div className="hr-company-logo-slot">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={
                        'Logo de ' +
                        company.name
                      }
                    />
                  ) : (
                    <span>
                      Logotipo
                    </span>
                  )}
                </div>

                <div className="hr-company-field">
                  <span>
                    CIF / NIF
                  </span>

                  <strong>
                    {company.tax_id}
                  </strong>
                </div>

                <div className="hr-company-field hr-company-address">
                  <span>
                    Dirección
                  </span>

                  <strong>
                    {company.address}
                  </strong>
                </div>

                <div className="hr-company-action">
                  <button
                    type="button"
                    className="hr-company-detail-button"
                    style={{
                      background: '#f4f3ee',
                      color: '#172b45',
                      border: '1px solid #f4f3ee',
                      boxShadow: 'none',
                    }}
                    onClick={() =>
                      handleOpenCompanyNominaUpload(
                        company,
                      )
                    }
                  >
                    Cargar nóminas
                  </button>
                </div>

              </div>
            </article>
          ))}
        </div>
      )}

  </div>
)}

{/* ================================================= */}
{/* DASHBOARD RR. HH. */}
{/* ================================================= */}

{companyView === 'dashboard' && (
  <div className="hr-dashboard">

    {/* ================================================= */}
    {/* BIENVENIDA */}
    {/* ================================================= */}

    <div className="hr-dashboard-welcome">
      <div>
        <h2>
          Bienvenido/a, {user.username}
        </h2>

        <p className="muted">
          Panel de control de Recursos Humanos
        </p>
      </div>
    </div>


    {/* ================================================= */}
    {/* TARJETAS PRINCIPALES */}
    {/* ================================================= */}

    <div className="hr-dashboard-stats">

      {/* EMPRESAS */}
      <article className="hr-stat-card">

        <div className="hr-stat-icon">
          🏢
        </div>

        <div className="hr-stat-body">

          <span>
            Empresas
          </span>

          <strong>
            {companies.length}
          </strong>

          <p>
            Empresas activas
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            setActiveMenu('companies')
            setCompanyView('companies')
            setSelectedCompany(null)
            setSelectedEmployee(null)
          }}
        >
          Ver empresas
          <span>→</span>
        </button>

      </article>


      {/* EMPLEADOS */}
      <article className="hr-stat-card">

        <div className="hr-stat-icon">
          👥
        </div>

        <div className="hr-stat-body">

          <span>
            Empleados
          </span>

          <strong>
            {employees.length}
          </strong>

          <p>
            Empleados activos
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            handleEnterAllEmployees()
          }}
        >
          Ver empleados
          <span>→</span>
        </button>

      </article>


      {/* CONTRATOS */}
      <article className="hr-stat-card">

        <div className="hr-stat-icon">
          📄
        </div>

        <div className="hr-stat-body">

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
              ? 'Contratos activos'
              : 'Almacén de contratos'}
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            setActiveMenu('contracts')
            setCompanyView('contractsBlank')
          }}
        >
          Gestionar
          <span>→</span>
        </button>

      </article>


      {/* NOMINAS */}
      <article className="hr-stat-card">

        <div className="hr-stat-icon">
          💳
        </div>

        <div className="hr-stat-body">

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
              ? 'Nóminas generadas'
              : 'almacen de nóminas'}
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            setActiveMenu('nominas')
            setCompanyView('nominasBlank')
          }}
        >
          Gestionar
          <span>→</span>
        </button>

      </article>

    </div>


    {/* ================================================= */}
    {/* ZONA INFERIOR */}
    {/* ================================================= */}

    <div className="hr-dashboard-bottom">

      {/* ================================================= */}
      {/* ACTIVIDAD RECIENTE */}
      {/* ================================================= */}

      <section className="hr-dashboard-box">

        <div className="hr-dashboard-box-header">

          <div>
            <p className="eyebrow">
              Actividad reciente
            </p>

            <h2>
              Actividad reciente
            </h2>
          </div>

        </div>


        <div className="hr-activity-list">

          {recentActivitiesLoading ? (
            <p className="muted">
              Cargando actividad reciente...
            </p>
          ) : recentActivitiesError ? (
            <p className="error">
              {recentActivitiesError}
            </p>
          ) : recentActivities.length === 0 ? (
            <div className="empty-state">
              <strong>
                No hay actividad reciente
              </strong>
              <p>
                Las últimas acciones realizadas aparecerán aquí.
              </p>
            </div>
          ) : (
            recentActivities.map((activity) => (
              <div
                className="hr-activity-item clickable"
                key={activity.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  handleRecentActivityClick(activity)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleRecentActivityClick(activity)
                  }
                }}
              >
                <div className="hr-activity-icon">
                  {activity.icon || '•'}
                </div>

                <div className="hr-activity-content">
                  <strong>
                    {activity.title}
                  </strong>

                  <span>
                    {activity.detail}
                  </span>
                </div>

                <time>
                  {formatActivityDateTime(activity.timestamp)}
                </time>
              </div>
            ))
          )}

        </div>


        <button
          type="button"
          className="hr-dashboard-view-all"
          onClick={() => setCompanyView('companies')}
        >
          Ver todo
        </button>

</section>


      {/* ================================================= */}
      {/* ACCESOS RAPIDOS */}
      {/* ================================================= */}

      <section className="hr-dashboard-box">

        <div className="hr-dashboard-box-header">

          <div>
            <p className="eyebrow">
              Accesos rápidos
            </p>

            <h2>
              Gestión habitual
            </h2>
          </div>

        </div>


        <div className="hr-quick-actions">

          <button
            type="button"
            className="hr-quick-action"
            onClick={handleAddCompany}
          >

            <div className="hr-quick-action-icon">
              🏢
            </div>

            <div className="hr-quick-action-content">

              <strong>
                Gestionar empresas
              </strong>

              <span>
                Añadir o editar empresas
              </span>

            </div>

            <span className="hr-quick-action-arrow">
              →
            </span>

          </button>


          <button
            type="button"
            className="hr-quick-action"
            onClick={() => {
              if (selectedCompany) {
                handleAddEmployee()
              } else {
                setCompanyView('companies')
              }
            }}
          >

            <div className="hr-quick-action-icon">
              👥
            </div>

            <div className="hr-quick-action-content">

              <strong>
                Gestionar empleados
              </strong>

              <span>
                Añadir o editar empleados
              </span>

            </div>

            <span className="hr-quick-action-arrow">
              →
            </span>

          </button>


          <button
            type="button"
            className="hr-quick-action"
            onClick={() => {
              setActiveMenu('contracts')
              if (selectedEmployee) {
                handleViewContracts(selectedEmployee)
              } else if (selectedCompany) {
                handleEnterEmployees()
              } else {
                setCompanyView('companies')
              }
            }}
          >

            <div className="hr-quick-action-icon">
              📄
            </div>

            <div className="hr-quick-action-content">

              <strong>
                Gestionar contratos
              </strong>

              <span>
                Consultar documentación
              </span>

            </div>

            <span className="hr-quick-action-arrow">
              →
            </span>

          </button>


          <button
            type="button"
            className="hr-quick-action"
            onClick={() => {
              setActiveMenu('nominas')
              if (selectedEmployee) {
                handleViewNominas(selectedEmployee)
              } else if (selectedCompany) {
                handleEnterEmployees()
              } else {
                setCompanyView('companies')
              }
            }}
          >

            <div className="hr-quick-action-icon">
              💳
            </div>

            <div className="hr-quick-action-content">

              <strong>
                Gestionar nóminas
              </strong>

              <span>
                Consultar nóminas
              </span>

            </div>

            <span className="hr-quick-action-arrow">
              →
            </span>

          </button>

        </div>

      </section>

    </div>


    {/* ================================================= */}
    {/* INFORMACION */}
    {/* ================================================= */}

    <section className="hr-dashboard-information">

      <div className="hr-information-icon">
        ✓
      </div>

      <div className="hr-information-content">

        <strong>
          Portal Laboraltus · Área de Recursos Humanos
        </strong>

        <p>
          Gestiona empresas, empleados, contratos y nóminas
          de forma rápida y segura.
        </p>

      </div>

    </section>

    <footer className="hr-dashboard-footer">
      © 2025 Portal Laboraltus. Todos los derechos reservados.
    </footer>

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

                  <button
                    type="button"
                    className="hr-companies-add-button"
                    onClick={handleAddCompany}
                  >
                    Añadir empresa
                  </button>

                  <button
                    type="button"
                    className="hr-company-detail-button"
                    style={{
                      background: '#f4f3ee',
                      color: '#172b45',
                      border: '1px solid #f4f3ee',
                      boxShadow: 'none',
                    }}
                    onClick={handleBackToDashboard}
                  >
                    Volver a Inicio
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

                    <label htmlFor="new-company-code">
                      Código empresa
                    </label>

                    <input
                      id="new-company-code"
                      type="text"
                      value={companyForm.company_code}
                      onChange={(event) =>
                        setCompanyForm({
                          ...companyForm,
                          company_code: event.target.value,
                        })
                      }
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

                    <label>
                      Logo de la empresa
                    </label>

                    <div className="hr-company-logo-editor">
                      <div className="hr-company-logo-preview">
                        {companyForm.logo ? (
                          <img
                            src={companyForm.logo}
                            alt="Vista previa del logo"
                          />
                        ) : (
                          <span>
                            Logo
                          </span>
                        )}
                      </div>

                      <div className="hr-company-logo-controls">
                        <input
                          ref={companyLogoFileInputRef}
                          id="new-company-logo"
                          type="file"
                          accept="image/*"
                          onChange={handleCompanyLogoChange}
                          className="hr-company-logo-file-input"
                        />

                        <label
                          htmlFor="new-company-logo"
                          className="hr-company-logo-button"
                        >
                          Seleccionar logo
                        </label>

                        {companyForm.logo && (
                          <button
                            type="button"
                            className="secondary hr-company-logo-remove"
                            onClick={handleRemoveCompanyLogo}
                            disabled={companyCreateSaving}
                          >
                            Quitar logo
                          </button>
                        )}

                        <span className="hr-company-logo-help">
                          Imagen JPG, PNG, SVG o WEBP
                        </span>
                      </div>
                    </div>

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
                        className="contract-card hr-company-card"
                        key={company.id}
                      >

                        <div className="hr-company-row">

                          <div className="hr-company-field hr-company-name">
                            <span>
                              Empresa
                            </span>

                            <strong>
                              {company.name}
                            </strong>
                          </div>

                          <div className="hr-company-logo-slot">
                            {company.logo ? (
                              <img
                                src={company.logo}
                                alt={
                                  'Logo de ' +
                                  company.name
                                }
                              />
                            ) : (
                              <span>
                                Logo
                              </span>
                            )}
                          </div>

                          <div className="hr-company-field">
                            <span>
                              CIF / NIF
                            </span>

                            <strong>
                              {company.tax_id}
                            </strong>
                          </div>

                          <div className="hr-company-field hr-company-address">
                            <span>
                              Direccion
                            </span>

                            <strong>
                              {company.address}
                            </strong>
                          </div>

                          <div className="hr-company-action">
                            <button
                              type="button"
                              className="download-button hr-companies-enter-button"
                              onClick={() =>
                                handleEnterCompany(
                                  company,
                                )
                              }
                            >
                              Entrar
                            </button>
                          </div>

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

                  <div className="profile-grid hr-company-detail-grid">

                    <div className="hr-company-detail-logo">
                      <span>
                        Logo
                      </span>

                      <div className="hr-company-detail-logo-box">
                        {selectedCompany.logo ? (
                          <img
                            src={contextCompanyLogo}
                            alt={
                              'Logo de ' +
                              selectedCompany.name
                            }
                          />
                        ) : (
                          <span>
                            Sin logo
                          </span>
                        )}
                      </div>
                    </div>

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

                  <div className="contract-document hr-company-detail-actions">

                    <button
                      type="button"
                      className="hr-company-detail-button"
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
                      className="hr-company-detail-button"
                      onClick={
                        handleEnterEmployees
                      }
                    >
                      Empleados
                    </button>

                    <input
                      ref={companyNominaFileInputRef}
                      type="file"
                      multiple
                      style={{ display: 'none' }}
                      onChange={
                        handleCompanyNominaFilesChange
                      }
                    />

                    <button
                      type="button"
                      className="hr-company-detail-button"
                      onClick={() => {
                        companyNominaFilesRef.current = []
                        if (companyNominaFileInputRef.current) {
                          companyNominaFileInputRef.current.value = ''
                          companyNominaFileInputRef.current.click()
                        }
                      }}
                    >
                      Cargar nóminas
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

                      <label htmlFor="company-code">
                        Código empresa
                      </label>

                      <input
                        id="company-code"
                        type="text"
                        value={
                          companyForm.company_code
                        }
                        onChange={(event) =>
                          setCompanyForm({
                            ...companyForm,
                            company_code:
                              event.target.value,
                          })
                        }
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

                      <label>
                        Logo de la empresa
                      </label>

                      <div className="hr-company-logo-editor">
                        <div className="hr-company-logo-preview">
                          {companyForm.logo ? (
                            <img
                              src={companyForm.logo}
                              alt="Vista previa del logo"
                            />
                          ) : (
                            <span>
                              Logo
                            </span>
                          )}
                        </div>

                        <div className="hr-company-logo-controls">
                          <input
                            ref={companyLogoFileInputRef}
                            id="company-logo"
                            type="file"
                            accept="image/*"
                            onChange={handleCompanyLogoChange}
                            className="hr-company-logo-file-input"
                          />

                          <label
                            htmlFor="company-logo"
                            className="hr-company-logo-button"
                          >
                            Seleccionar logotipo
                          </label>

                          <span className="hr-company-logo-help">
                            Imagen JPG, PNG, SVG o WEBP
                          </span>
                        </div>
                      </div>

                      {companiesError && (
                        <p className="error">
                          {companiesError}
                        </p>
                      )}

                      <div className="contract-document hr-company-edit-actions">

                        <button
                          type="submit"
                          className="hr-company-edit-save-button"
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
                          className="secondary hr-company-edit-cancel-button"
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
          {/* PANEL GENERAL DE EMPLEADOS */}
          {/* ================================================= */}

          {companyView === 'employeesAll' && (
            <div className="contracts">

              <div className="section-header hr-employees-section-header">

                <div className="hr-employees-title-block">
                  <p className="eyebrow">
                    Gestión de empleados
                  </p>

                  <h2>
                    Empleados
                  </h2>
                </div>

                <div className="contract-document">

                  <button
                    type="button"
                    className="hr-company-detail-button"
                    style={{
                      background: '#f4f3ee',
                      color: '#172b45',
                      border: '1px solid #f4f3ee',
                      boxShadow: 'none',
                      whiteSpace: 'nowrap',
                      minWidth: '170px',
                      height: '60px',
                    }}
                    onClick={handleBackToDashboard}
                  >
                    Volver a Inicio
                  </button>

                </div>

              </div>

              {employeesLoading && (
                <p className="muted">
                  Cargando empleados...
                </p>
              )}

              {!employeesLoading && employeesError && (
                <p className="error">
                  {employeesError}
                </p>
              )}

              {!employeesLoading &&
                !employeesError &&
                employees.length === 0 && (
                  <div className="empty-state">
                    <strong>
                      No hay empleados
                    </strong>
                    <p>
                      No se encontraron empleados en el sistema.
                    </p>
                  </div>
                )}

              {!employeesLoading &&
                !employeesError &&
                employees.length > 0 && (
                  <div className="contract-list">
                    {[...employees]
                      .sort((a, b) => {
                        const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim()
                        const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim()
                        return nameA.localeCompare(nameB, 'es', {
                          sensitivity: 'base',
                        })
                      })
                      .map((employee) => {
                      const employeeCompany =
                        getCompanyForEmployee(employee)
                      const employeeCompanyLogo =
                        employeeCompany?.logo ||
                        getStoredCompanyLogo(employee.company_id) ||
                        ''

                      return (
                        <article
                          className="contract-card hr-general-employee-card"
                          key={employee.id}
                        >
                          <div className="hr-general-employee-row">

                            <div className="hr-general-employee-field">
                              <span>
                                Empleado
                              </span>
                              <strong>
                                {employee.first_name}{' '}
                                {employee.last_name}
                              </strong>
                            </div>

                            <div className="hr-general-employee-logo">
                              {employeeCompanyLogo ? (
                                <img
                                  src={employeeCompanyLogo}
                                  alt={
                                    'Logo de ' +
                                    (employeeCompany?.name || 'la empresa')
                                  }
                                />
                              ) : (
                                <span>
                                  Logo
                                </span>
                              )}
                            </div>

                            <div className="hr-general-employee-field">
                              <span>
                                Empresa
                              </span>
                              <strong>
                                {employeeCompany?.name ||
                                  'Empresa no encontrada'}
                              </strong>
                            </div>

                            <div className="hr-general-employee-action">
                              <button
                                type="button"
                                className="hr-employees-enter-button"
                                onClick={() =>
                                  handleEnterEmployee(employee)
                                }
                              >
                                Entrar
                              </button>
                            </div>

                          </div>
                        </article>
                      )
                    })}
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

                <div className="section-header hr-employees-section-header">

                  <div className="hr-employees-title-block">
                    <p className="eyebrow">
                      {selectedCompany.name}
                    </p>

                    <h2>
                      Empleados
                    </h2>
                  </div>

                  {contextCompanyLogo && (
                    <div className="hr-context-company-logo">
                      <img
                        src={contextCompanyLogo}
                        alt={
                          'Logo de ' +
                          selectedCompany.name
                        }
                      />
                    </div>
                  )}

                  <div className="contract-document">

                    <button
                      type="button"
                      className="hr-employees-add-button"
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

                    <button
                      type="button"
                      className="hr-company-detail-button"
                      style={{
                        background: '#f4f3ee',
                        color: '#172b45',
                        border: '1px solid #f4f3ee',
                        boxShadow: 'none',
                      }}
                      onClick={handleBackToDashboard}
                    >
                      Volver a Inicio
                    </button>

                  </div>

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

                      <label htmlFor="new-employee-code">
                        Código empleado
                      </label>

                      <input
                        id="new-employee-code"
                        type="text"
                        value={
                          newEmployeeForm.employee_code
                        }
                        onChange={(event) =>
                          setNewEmployeeForm({
                            ...newEmployeeForm,
                            employee_code:
                              event.target.value,
                          })
                        }
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
                                className="download-button hr-employees-enter-button"
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

                <div className="section-header hr-employee-detail-header">

                  <div className="hr-employee-detail-title">
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

                  {contextCompanyLogo && (
                    <div className="hr-context-company-logo">
                      <img
                        src={contextCompanyLogo}
                        alt={
                          'Logo de ' +
                          selectedCompany.name
                        }
                      />
                    </div>
                  )}

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

                  <div className="contract-document hr-employee-detail-actions">

                    <button
                      type="button"
                      className="hr-employee-detail-button"
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
                      className="hr-employee-detail-button"
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
                      className="hr-employee-detail-button"
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

                      <label htmlFor="employee-code">
                        Código empleado
                      </label>

                      <input
                        id="employee-code"
                        type="text"
                        value={
                          employeeForm.employee_code
                        }
                        onChange={(event) =>
                          setEmployeeForm({
                            ...employeeForm,
                            employee_code:
                              event.target.value,
                          })
                        }
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

                      <div className="contract-document hr-employee-edit-actions">

                        <button
                          type="submit"
                          className="hr-employee-edit-save-button"
                          style={{
                            background: '#f4f3ee',
                            color: '#172b45',
                            border: '1px solid #f4f3ee',
                            boxShadow: 'none',
                          }}
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
                          className="secondary hr-employee-edit-cancel-button"
                          style={{
                            background: '#f4f3ee',
                            color: '#172b45',
                            border: '1px solid #f4f3ee',
                            boxShadow: 'none',
                          }}
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

                <div className="section-header hr-contracts-header">

                  <div className="hr-contracts-title-block">
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

                  {contextCompanyLogo && (
                    <div className="hr-context-company-logo">
                      <img
                        src={contextCompanyLogo}
                        alt={
                          'Logo de ' +
                          selectedCompany.name
                        }
                      />
                    </div>
                  )}

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

                  <div className="contract-document hr-contracts-employee-actions">

                    <button
                      type="button"
                      className="hr-contracts-action-button"
                      style={{
                        background: '#f4f3ee',
                        color: '#172b45',
                        border: '1px solid #f4f3ee',
                        boxShadow: 'none',
                      }}
                      onClick={
                        handleAddContracts
                      }
                    >
                      Añadir contratos
                    </button>

                    <button
                      type="button"
                      className="hr-contracts-action-button"
                      style={{
                        background: '#f4f3ee',
                        color: '#172b45',
                        border: '1px solid #f4f3ee',
                        boxShadow: 'none',
                      }}
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

                <div className="section-header hr-contracts-header">

                  <div className="hr-contracts-title-block">
                    <p className="eyebrow">
                      Almacén de contratos
                    </p>

                    <h2>
                      Contratos almacenados
                    </h2>
                  </div>

                  {contextCompanyLogo && (
                    <div className="hr-context-company-logo">
                      <img
                        src={contextCompanyLogo}
                        alt={
                          'Logo de ' +
                          selectedCompany.name
                        }
                      />
                    </div>
                  )}

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
                                  className="download-button hr-contracts-download-button"
                                  style={{
                                    background: '#f4f3ee',
                                    color: '#172b45',
                                    border: '1px solid #f4f3ee',
                                    boxShadow: 'none',
                                  }}
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

                <div className="section-header hr-nominas-header">

                  <div className="hr-nominas-title-block">
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

                  {contextCompanyLogo && (
                    <div className="hr-context-company-logo">
                      <img
                        src={contextCompanyLogo}
                        alt={
                          'Logo de ' +
                          selectedCompany.name
                        }
                      />
                    </div>
                  )}

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

                  <div className="contract-document hr-nominas-actions">

                    <button
                      type="button"
                      className="hr-nominas-action-button"
                      style={{
                        background: '#f4f3ee',
                        color: '#172b45',
                        border: '1px solid #f4f3ee',
                        boxShadow: 'none',
                      }}
                      onClick={
                        handleAddNominas
                      }
                    >
                      Añadir nóminas
                    </button>

                    <button
                      type="button"
                      className="hr-nominas-action-button"
                      style={{
                        background: '#f4f3ee',
                        color: '#172b45',
                        border: '1px solid #f4f3ee',
                        boxShadow: 'none',
                      }}
                      onClick={
                        handleNominaStore
                      }
                    >
                      Almacén de contratos
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

                <div className="section-header hr-nominas-header">

                  <div className="hr-nominas-title-block">
                    <p className="eyebrow">
                      Almacén de nóminas
                    </p>

                    <h2>
                      Nóminas almacenadas
                    </h2>
                  </div>

                  {contextCompanyLogo && (
                    <div className="hr-context-company-logo">
                      <img
                        src={contextCompanyLogo}
                        alt={
                          'Logo de ' +
                          selectedCompany.name
                        }
                      />
                    </div>
                  )}

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
                                  className="download-button hr-nominas-download-button"
                                  style={{
                                    background: '#f4f3ee',
                                    color: '#172b45',
                                    border: '1px solid #f4f3ee',
                                    boxShadow: 'none',
                                  }}
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

</div>
        </div>
      </main>
    )
  }

  // =========================================================
  // PORTAL EMPLEADO
  // =========================================================

  if (loggedIn && user) {
    const employeeFullName =
      `${user.first_name || ''} ${user.last_name || ''}`.trim()
    const employeeCompanyName =
      user.company_name || 'Empresa'
    const employeeCompanyLogo =
      user.company_logo || ''
    const employeePortalName =
      'PORTAL ' + employeeCompanyName

    return (
      <main className="app employee-app">
        <aside className="employee-sidebar">

          <div className="employee-brand">
            <div className="employee-brand-logo">
              {employeeCompanyLogo ? (
                <img
                  src={employeeCompanyLogo}
                  alt={'Logo de ' + employeeCompanyName}
                />
              ) : (
                <span>Sin logo</span>
              )}
            </div>

            <div className="employee-brand-name">
              {employeeCompanyName}
            </div>
          </div>

          <nav className="employee-nav">
            <button
              type="button"
              className={
                employeeActiveMenu === 'dashboard'
                  ? 'employee-nav-button active'
                  : 'employee-nav-button'
              }
              onClick={() => {
                setEmployeePortalView('dashboard')
                setEmployeeActiveMenu('dashboard')
              }}
            >
              <span className="employee-nav-icon">⌂</span>
              Inicio
            </button>

            <button
              type="button"
              className={
                employeeActiveMenu === 'profile'
                  ? 'employee-nav-button active'
                  : 'employee-nav-button'
              }
              onClick={() => {
                setEmployeePortalView('profile')
                setEmployeeActiveMenu('profile')
              }}
            >
              <span className="employee-nav-icon">👤</span>
              Mi perfil
            </button>

            <button
              type="button"
              className={
                employeeActiveMenu === 'contracts'
                  ? 'employee-nav-button active'
                  : 'employee-nav-button'
              }
              onClick={() => {
                setEmployeePortalView('contracts')
                setEmployeeActiveMenu('contracts')
              }}
            >
              <span className="employee-nav-icon">📄</span>
              Contratos
            </button>

            <button
              type="button"
              className={
                employeeActiveMenu === 'nominas'
                  ? 'employee-nav-button active'
                  : 'employee-nav-button'
              }
              onClick={() => {
                setEmployeePortalView('nominas')
                setEmployeeActiveMenu('nominas')
              }}
            >
              <span className="employee-nav-icon">💳</span>
              Nóminas
            </button>
          </nav>

          <div className="employee-sidebar-bottom">
            <div className="employee-user-box">
              <div className="employee-user-avatar">
                <span>👤</span>
              </div>

              <div>
                <strong>{employeeFullName}</strong>
                <span>Empleado/a</span>
              </div>
            </div>

            <button
              type="button"
              className="employee-logout-button"
              onClick={handleLogout}
            >
              <span className="employee-nav-icon">↪</span>
              Cerrar sesión
            </button>
          </div>

        </aside>

        <div className="employee-main">
          <div className="employee-topbar">
            <div className="employee-topbar-title">
              <p className="eyebrow">
                {employeePortalName}
              </p>

              <h1 className="employee-panel-title">
                Panel de control del empleado
              </h1>
            </div>

            <div className="employee-topbar-date">
              <span className="employee-topbar-date-icon">
                ▣
              </span>

              <span>
                {currentDateTime.toLocaleDateString(
                  'es-ES',
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Europe/Madrid',
                  },
                )}{' · '}
                {currentDateTime.toLocaleTimeString(
                  'es-ES',
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Madrid',
                  },
                )}
              </span>
            </div>
          </div>

          {employeePortalView === 'dashboard' && (
            <div className="employee-dashboard">
              <div className="employee-dashboard-welcome">
                <div>
                  <h2>
                    Bienvenido/a, {employeeFullName}
                  </h2>

                  <p className="muted">
                    Panel de control del empleado
                  </p>
                </div>
              </div>

              <div className="employee-dashboard-stats">

                <article
                  className="employee-stat-card employee-stat-profile"
                  onClick={() => {
                    setEmployeePortalView('profile')
                    setEmployeeActiveMenu('profile')
                  }}
                >
                  <div className="employee-stat-icon">
                    👥
                  </div>

                  <div className="employee-stat-body">
                    <span>Mi perfil</span>
                    <strong>Datos</strong>
                    <p>Mis datos</p>
                  </div>
                </article>

                <article
                  className="employee-stat-card"
                  onClick={() => {
                    setEmployeePortalView('contracts')
                    setEmployeeActiveMenu('contracts')
                  }}
                >
                  <div className="employee-stat-icon">
                    📄
                  </div>

                  <div className="employee-stat-body">
                    <span>Contratos</span>
                    <strong>
                      {contracts.length}
                    </strong>
                    <p>Almacén de contratos</p>
                  </div>
                </article>

                <article
                  className="employee-stat-card"
                  onClick={() => {
                    setEmployeePortalView('nominas')
                    setEmployeeActiveMenu('nominas')
                  }}
                >
                  <div className="employee-stat-icon">
                    💳
                  </div>

                  <div className="employee-stat-body">
                    <span>Nóminas</span>
                    <strong>
                      {nominas.length}
                    </strong>
                    <p>Almacén de nóminas</p>
                  </div>
                </article>
              </div>

              <div className="employee-dashboard-bottom">
                <section className="employee-dashboard-box employee-dashboard-activity-box">
                  <div className="employee-dashboard-box-header">
                    <p className="eyebrow">
                      ACTIVIDAD RECIENTE
                    </p>
                    <h2>Actividad reciente</h2>
                  </div>

                  <div className="hr-activity-list">
                    {recentActivitiesLoading ? (
                      <p className="muted">
                        Cargando actividad reciente...
                      </p>
                    ) : recentActivitiesError ? (
                      <p className="error">
                        {recentActivitiesError}
                      </p>
                    ) : recentActivities.length === 0 ? (
                      <div className="empty-state">
                        <strong>
                          No hay actividad reciente
                        </strong>
                        <p>
                          Las últimas acciones realizadas sobre tu documentación aparecerán aquí.
                        </p>
                      </div>
                    ) : (
                      recentActivities.map((activity) => (
                        <div
                          className="hr-activity-item"
                          key={activity.id}
                        >
                          <div className="hr-activity-icon">
                            {activity.icon || '•'}
                          </div>

                          <div className="hr-activity-content">
                            <strong>
                              {activity.title}
                            </strong>

                            <span>
                              {activity.detail}
                            </span>
                          </div>

                          <time>
                            {formatActivityDateTime(activity.timestamp)}
                          </time>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="employee-dashboard-box">
                  <div className="employee-dashboard-box-header">
                    <p className="eyebrow">
                      ACCESOS RÁPIDOS
                    </p>
                    <h2>Gestión habitual</h2>
                  </div>

                  <div className="employee-quick-actions">
                    <button
                      type="button"
                      className="employee-quick-action"
                      onClick={async () => {
                        const token = localStorage.getItem('access_token')

                        if (!token || !user?.id) {
                          setEmployeePortalView('contracts')
                          setEmployeeActiveMenu('contracts')
                          return
                        }

                        try {
                          const response = await fetch(
                            API_URL +
                              '/api/employees/' +
                              user.id +
                              '/contracts',
                            {
                              headers: {
                                Authorization: 'Bearer ' + token,
                              },
                            },
                          )

                          const data = await response.json().catch(() => [])

                          if (!response.ok) {
                            throw new Error(
                              data?.detail ||
                                'No se pudo cargar el último contrato',
                            )
                          }

                          const latestContract =
                            (Array.isArray(data) ? data : [])
                              .filter((contract) => contract.document_path)
                              .sort(
                                (a, b) =>
                                  Number(b.id || 0) - Number(a.id || 0),
                              )[0] || null

                          if (latestContract) {
                            await handleViewContract(
                              latestContract,
                              user.id,
                            )
                          } else {
                            setEmployeePortalView('contracts')
                            setEmployeeActiveMenu('contracts')
                          }
                        } catch (err) {
                          setContractsError(err.message)
                          setEmployeePortalView('contracts')
                          setEmployeeActiveMenu('contracts')
                        }
                      }}
                    >
                      <span className="employee-quick-action-icon">
                        📄
                      </span>
                      <span className="employee-quick-action-content">
                        <strong>Último contrato</strong>
                        <span>
                          Consultar el último contrato cargado
                        </span>
                      </span>
                      <span className="employee-quick-action-arrow">
                        →
                      </span>
                    </button>

                    <button
                      type="button"
                      className="employee-quick-action"
                      onClick={async () => {
                        const token = localStorage.getItem('access_token')

                        if (!token || !user?.id) {
                          setEmployeePortalView('nominas')
                          setEmployeeActiveMenu('nominas')
                          return
                        }

                        try {
                          const response = await fetch(
                            API_URL +
                              '/api/employees/' +
                              user.id +
                              '/nominas',
                            {
                              headers: {
                                Authorization: 'Bearer ' + token,
                              },
                            },
                          )

                          const data = await response.json().catch(() => [])

                          if (!response.ok) {
                            throw new Error(
                              data?.detail ||
                                'No se pudo cargar la última nómina',
                            )
                          }

                          const latestNomina =
                            (Array.isArray(data) ? data : [])
                              .filter((nomina) => nomina.document_path)
                              .sort((a, b) => {
                                const dateA =
                                  a.date ? new Date(a.date).getTime() : 0
                                const dateB =
                                  b.date ? new Date(b.date).getTime() : 0

                                if (dateB !== dateA) {
                                  return dateB - dateA
                                }

                                return Number(b.id || 0) - Number(a.id || 0)
                              })[0] || null

                          if (latestNomina) {
                            await handleViewNomina(
                              latestNomina,
                              user.id,
                            )
                          } else {
                            setEmployeePortalView('nominas')
                            setEmployeeActiveMenu('nominas')
                          }
                        } catch (err) {
                          setNominasError(err.message)
                          setEmployeePortalView('nominas')
                          setEmployeeActiveMenu('nominas')
                        }
                      }}
                    >
                      <span className="employee-quick-action-icon">
                        💳
                      </span>
                      <span className="employee-quick-action-content">
                        <strong>Última nómina</strong>
                        <span>
                          Consultar la última nómina cargada
                        </span>
                      </span>
                      <span className="employee-quick-action-arrow">
                        →
                      </span>
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}

          {employeePortalView === 'profile' && (
            <div className="employee-content-panel">
              <div className="employee-content-header">
                <div>
                  <p className="eyebrow">
                    INFORMACIÓN PERSONAL
                  </p>

                  <h2>
                    Mi perfil
                  </h2>
                </div>

                <div className="employee-contracts-landing-header-actions">
                  {employeeCompanyLogo ? (
                    <div className="employee-contracts-company-logo">
                      <img
                        src={employeeCompanyLogo}
                        alt={'Logo de ' + employeeCompanyName}
                      />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="employee-back-button"
                    onClick={() => {
                      setEmployeePortalView('dashboard')
                      setEmployeeActiveMenu('dashboard')
                    }}
                  >
                    Volver
                  </button>
                </div>
              </div>

              <div className="employee-info-list">
                <div>
                  <span>Nombre completo</span>
                  <strong>{employeeFullName}</strong>
                </div>

                <div>
                  <span>Puesto</span>
                  <strong>
                    {user.job_title || 'Sin puesto'}
                  </strong>
                </div>

                <div>
                  <span>Categoría</span>
                  <strong>
                    {user.job_category || 'Sin categoría'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {employeePortalView === 'contracts' && (
            <div className="employee-content-panel employee-contracts-landing">

              <div className="employee-content-header employee-contracts-landing-header">
                <div>
                  <p className="eyebrow">
                    DOCUMENTACIÓN LABORAL
                  </p>

                  <h2>
                    Mis contratos
                  </h2>
                </div>

                <div className="employee-contracts-landing-header-actions">
                  {employeeCompanyLogo ? (
                    <div className="employee-contracts-company-logo">
                      <img
                        src={employeeCompanyLogo}
                        alt={'Logo de ' + employeeCompanyName}
                      />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="employee-back-button"
                    onClick={() => {
                      setEmployeePortalView('dashboard')
                      setEmployeeActiveMenu('dashboard')
                    }}
                  >
                    Volver
                  </button>
                </div>
              </div>

              <div className="employee-landing-identity">
                <p className="eyebrow">
                  EMPLEADO
                </p>

                <h3>
                  {employeeFullName}
                </h3>
              </div>

              <section className="employee-contracts-menu-card">
                <div className="employee-contracts-identity-card">
                  <span>
                    Nombre
                  </span>

                  <strong>
                    {employeeFullName}
                  </strong>
                </div>

                <div className="employee-contracts-menu-actions">
                  <button
                    type="button"
                    className="employee-contracts-menu-button"
                    onClick={async () => {
                      const token = localStorage.getItem('access_token')

                      if (selectedEmployee && token) {
                        await loadContracts(
                          selectedEmployee.id,
                          token,
                        )
                        await loadDownloadedContracts(
                          selectedEmployee.id,
                          token,
                        )
                      }

                      setEmployeePortalView('contractsStore')
                      setEmployeeActiveMenu('contracts')
                    }}
                  >
                    Contratos nuevos
                  </button>

                  <button
                    type="button"
                    className="employee-contracts-menu-button employee-contracts-menu-button-nominas"
                    onClick={async () => {
                      const token = localStorage.getItem('access_token')

                      if (selectedEmployee && token) {
                        await loadContracts(
                          selectedEmployee.id,
                          token,
                        )
                        await loadDownloadedContracts(
                          selectedEmployee.id,
                          token,
                        )
                      }

                      setEmployeePortalView('contractArchive')
                      setEmployeeActiveMenu('contracts')
                    }}
                  >
                    Almacén de contratos
                  </button>
                </div>
              </section>

            </div>
          )}

          {employeePortalView === 'contractsStore' && (
            <div className="employee-content-panel">
              <div className="employee-content-header">
                <div>
                  <p className="eyebrow">
                    DOCUMENTACIÓN LABORAL
                  </p>
                  <h2>
                    Mis contratos
                  </h2>
                </div>

                <div className="employee-contracts-landing-header-actions">
                  {employeeCompanyLogo ? (
                    <div className="employee-contracts-company-logo">
                      <img
                        src={employeeCompanyLogo}
                        alt={'Logo de ' + employeeCompanyName}
                      />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="employee-back-button"
                    onClick={() => {
                      setEmployeePortalView('contracts')
                      setEmployeeActiveMenu('contracts')
                    }}
                  >
                    Volver
                  </button>
                </div>
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

              {contractsLoading && (
                <p className="muted">
                  Cargando contratos...
                </p>
              )}

              {!contractsLoading && contractsError && (
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
                      Todavía no hay contratos asociados a tu perfil.
                    </p>
                  </div>
                )}

              {!contractsLoading &&
                contracts.length > 0 && (
                  <div className="contract-list">
                    {contracts.map((contract) => (
                      <article
                        className="contract-card"
                        key={contract.id}
                      >
                        <div className="contract-info">
                          <div>
                            <span>Tipo de contrato</span>
                            <strong>
                              {contract.contract_type}
                            </strong>
                          </div>

                          <div>
                            <span>Inicio</span>
                            <strong>
                              {formatDate(
                                contract.start_date,
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>Fin</span>
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
                              className="download-button employee-contract-download-button"
                              onClick={() =>
                                downloadedContractIds.includes(contract.id)
                                  ? undefined
                                  : handleDownload(contract)
                              }
                              disabled={downloadedContractIds.includes(contract.id)}
                            >
                              {downloadedContractIds.includes(contract.id)
                                ? 'Documento descargado'
                                : 'Descargar documento'}
                            </button>
                          ) : (
                            <span className="no-document">
                              Documento no disponible
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
            </div>
          )}


          {employeePortalView === 'contractArchive' && (
            <div className="employee-content-panel">
              <div className="employee-content-header">
                <div>
                  <p className="eyebrow">
                    DOCUMENTACIÓN LABORAL
                  </p>
                  <h2>
                    Almacén de contratos
                  </h2>
                </div>

                <div className="employee-contracts-landing-header-actions">
                  {employeeCompanyLogo ? (
                    <div className="employee-contracts-company-logo">
                      <img
                        src={employeeCompanyLogo}
                        alt={'Logo de ' + employeeCompanyName}
                      />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="employee-back-button"
                    onClick={() => {
                      setEmployeePortalView('contracts')
                      setEmployeeActiveMenu('contracts')
                    }}
                  >
                    Volver
                  </button>
                </div>
              </div>

              {!contractsLoading &&
                !contractsError &&
                contracts.filter(
                  (contract) =>
                    contract.document_path &&
                    downloadedContractIds.includes(contract.id),
                ).length === 0 && (
                  <div className="empty-state">
                    <strong>
                      No hay contratos almacenados
                    </strong>
                    <p>
                      Los contratos aparecen aquí después de ser descargados.
                    </p>
                  </div>
                )}

              {!contractsLoading &&
                contracts.length > 0 && (
                  <div className="contract-list">
                    {contracts
                      .filter(
                        (contract) =>
                          contract.document_path &&
                          downloadedContractIds.includes(contract.id),
                      )
                      .map((contract) => (
                        <article
                          className="contract-card"
                          key={contract.id}
                        >
                          <div className="contract-info">
                            <div>
                              <span>Tipo de contrato</span>
                              <strong>
                                {contract.contract_type}
                              </strong>
                            </div>

                            <div>
                              <span>Inicio</span>
                              <strong>
                                {formatDate(contract.start_date)}
                              </strong>
                            </div>

                            <div>
                              <span>Fin</span>
                              <strong>
                                {contract.end_date
                                  ? formatDate(contract.end_date)
                                  : 'Indefinido'}
                              </strong>
                            </div>
                          </div>

                          <div className="contract-document">
                            <button
                              type="button"
                              className="download-button employee-contract-download-button"
                              onClick={() =>
                                handleViewContract(contract)
                              }
                            >
                              Ver contrato
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                )}
            </div>
          )}

          {employeePortalView === 'nominas' && (
            <div className="employee-content-panel employee-contracts-landing">

              <div className="employee-content-header employee-contracts-landing-header">
                <div>
                  <p className="eyebrow">
                    DOCUMENTACIÓN LABORAL
                  </p>

                  <h2>
                    Mis nóminas
                  </h2>
                </div>

                <div className="employee-contracts-landing-header-actions">
                  {employeeCompanyLogo ? (
                    <div className="employee-contracts-company-logo">
                      <img
                        src={employeeCompanyLogo}
                        alt={'Logo de ' + employeeCompanyName}
                      />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="employee-back-button"
                    onClick={() => {
                      setEmployeePortalView('dashboard')
                      setEmployeeActiveMenu('dashboard')
                    }}
                  >
                    Volver
                  </button>
                </div>
              </div>

              <div className="employee-landing-identity">
                <p className="eyebrow">
                  EMPLEADO
                </p>

                <h3>
                  {employeeFullName}
                </h3>
              </div>

              <section className="employee-contracts-menu-card">
                <div className="employee-contracts-identity-card">
                  <span>
                    Nombre
                  </span>

                  <strong>
                    {employeeFullName}
                  </strong>
                </div>

                <div className="employee-contracts-menu-actions">
                  <button
                    type="button"
                    className="employee-contracts-menu-button"
                    onClick={async () => {
                      const token = localStorage.getItem('access_token')

                      if (selectedEmployee && token) {
                        await loadNominas(
                          selectedEmployee.id,
                          token,
                        )
                        await loadDownloadedNominas(
                          selectedEmployee.id,
                          token,
                        )
                      }

                      setEmployeePortalView('nominasStore')
                      setEmployeeActiveMenu('nominas')
                    }}
                  >
                    Nóminas nuevas
                  </button>

                  <button
                    type="button"
                    className="employee-contracts-menu-button employee-contracts-menu-button-nominas"
                    onClick={async () => {
                      const token = localStorage.getItem('access_token')

                      if (selectedEmployee && token) {
                        await loadNominas(
                          selectedEmployee.id,
                          token,
                        )
                        await loadDownloadedNominas(
                          selectedEmployee.id,
                          token,
                        )
                      }

                      setEmployeePortalView('nominaArchive')
                      setEmployeeActiveMenu('nominas')
                    }}
                  >
                    Almacén de nóminas
                  </button>
                </div>
              </section>

            </div>
          )}

          {employeePortalView === 'nominasStore' && (
            <div className="employee-content-panel">
              <div className="employee-content-header">
                <div>
                  <p className="eyebrow">
                    DOCUMENTACIÓN LABORAL
                  </p>
                  <h2>
                    Mis nóminas
                  </h2>
                </div>

                <div className="employee-contracts-landing-header-actions">
                  {employeeCompanyLogo ? (
                    <div className="employee-contracts-company-logo">
                      <img
                        src={employeeCompanyLogo}
                        alt={'Logo de ' + employeeCompanyName}
                      />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="employee-back-button"
                    onClick={() => {
                      setEmployeePortalView('nominas')
                      setEmployeeActiveMenu('nominas')
                    }}
                  >
                    Volver
                  </button>
                </div>
              </div>

              {!nominasLoading &&
                nominas.length > 0 && (
                  <span className="contract-count">
                    {nominas.length}{' '}
                    {nominas.length === 1
                      ? 'nómina'
                      : 'nóminas'}
                  </span>
                )}

              {nominasLoading && (
                <p className="muted">
                  Cargando nóminas...
                </p>
              )}

              {!nominasLoading && nominasError && (
                <p className="error">
                  {nominasError}
                </p>
              )}

              {!nominasLoading &&
                !nominasError &&
                nominas.length === 0 && (
                  <div className="empty-state">
                    <strong>
                      No hay nóminas disponibles
                    </strong>
                    <p>
                      Todavía no hay nóminas asociadas a tu perfil.
                    </p>
                  </div>
                )}

              {!nominasLoading &&
                nominas.length > 0 && (
                  <div className="contract-list">
                    {nominas.map((nomina) => (
                      <article
                        className="contract-card"
                        key={nomina.id}
                      >
                        <div className="contract-info">
                          <div>
                            <span>Fecha</span>
                            <strong>
                              {formatDate(nomina.date)}
                            </strong>
                          </div>
                        </div>

                        <div className="contract-document">
                          {nomina.document_path ? (
                            <button
                              type="button"
                              className="download-button employee-contract-download-button"
                              onClick={() =>
                                downloadedNominaIds.includes(nomina.id)
                                  ? undefined
                                  : handleDownloadNomina(nomina)
                              }
                              disabled={downloadedNominaIds.includes(nomina.id)}
                            >
                              {downloadedNominaIds.includes(nomina.id)
                                ? 'Documento descargado'
                                : 'Descargar documento'}
                            </button>
                          ) : (
                            <span className="no-document">
                              Documento no disponible
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
            </div>
          )}

          {employeePortalView === 'nominaArchive' && (
            <div className="employee-content-panel">
              <div className="employee-content-header">
                <div>
                  <p className="eyebrow">
                    DOCUMENTACIÓN LABORAL
                  </p>
                  <h2>
                    Almacén de nóminas
                  </h2>
                </div>

                <div className="employee-contracts-landing-header-actions">
                  {employeeCompanyLogo ? (
                    <div className="employee-contracts-company-logo">
                      <img
                        src={employeeCompanyLogo}
                        alt={'Logo de ' + employeeCompanyName}
                      />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="employee-back-button"
                    onClick={() => {
                      setEmployeePortalView('nominas')
                      setEmployeeActiveMenu('nominas')
                    }}
                  >
                    Volver
                  </button>
                </div>
              </div>

              {!nominasLoading &&
                !nominasError &&
                nominas.filter(
                  (nomina) =>
                    nomina.document_path &&
                    downloadedNominaIds.includes(nomina.id),
                ).length === 0 && (
                  <div className="empty-state">
                    <strong>
                      No hay nóminas almacenadas
                    </strong>
                    <p>
                      Las nóminas aparecen aquí después de ser descargadas.
                    </p>
                  </div>
                )}

              {!nominasLoading &&
                nominas.length > 0 && (
                  <div className="contract-list">
                    {nominas
                      .filter(
                        (nomina) =>
                          nomina.document_path &&
                          downloadedNominaIds.includes(nomina.id),
                      )
                      .map((nomina) => (
                        <article
                          className="contract-card"
                          key={nomina.id}
                        >
                          <div className="contract-info">
                            <div>
                              <span>Fecha</span>
                              <strong>
                                {formatDate(nomina.date)}
                              </strong>
                            </div>
                          </div>

                          <div className="contract-document">
                            <button
                              type="button"
                              className="download-button employee-contract-download-button"
                              onClick={() =>
                                handleViewNomina(nomina)
                              }
                            >
                              Ver nómina
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                )}
            </div>
          )}

        </div>
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
