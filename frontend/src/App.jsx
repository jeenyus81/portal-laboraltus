import { useState } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  const [contracts, setContracts] = useState([])
  const [contractsLoading, setContractsLoading] = useState(false)
  const [contractsError, setContractsError] = useState('')

  const [nominas, setNominas] = useState([])
  const [nominasLoading, setNominasLoading] = useState(false)
  const [nominasError, setNominasError] = useState('')

  const [employees, setEmployees] = useState([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [employeesError, setEmployeesError] = useState('')

  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState({})
  const [selectedNominaFiles, setSelectedNominaFiles] = useState({})
  const [employeeSection, setEmployeeSection] = useState('contracts')

  async function loadContracts(employeeId, token) {
    setContractsLoading(true)
    setContractsError('')

    try {
      const response = await fetch(
        API_URL + '/api/employees/' + employeeId + '/contracts',
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

  async function loadNominas(employeeId, token) {
    setNominasLoading(true)
    setNominasError('')

    try {
      const response = await fetch(
        API_URL + '/api/employees/' + employeeId + '/nominas',
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

  async function handleSelectEmployee(employee) {
    const token = localStorage.getItem(
      'access_token',
    )

    if (!token) {
      setEmployeesError(
        'No hay una sesion valida',
      )
      return
    }

    setSelectedEmployee(employee)
    setSelectedFiles({})
    setSelectedNominaFiles({})
    setEmployeeSection('contracts')

    await loadContracts(
      employee.id,
      token,
    )
  }

  async function handleViewNominas(employee) {
    const token = localStorage.getItem(
      'access_token',
    )

    if (!token) {
      setEmployeesError(
        'No hay una sesion valida',
      )
      return
    }

    setSelectedEmployee(employee)
    setSelectedFiles({})
    setSelectedNominaFiles({})
    setEmployeeSection('nominas')

    await loadNominas(
      employee.id,
      token,
    )
  }

  async function handleDownload(
    contract,
    employeeId = null,
  ) {
    const token = localStorage.getItem(
      'access_token',
    )

    if (!token) {
      setContractsError(
        'No hay una sesion valida',
      )
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
          Authorization:
            'Bearer ' + token,
        },
      })

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null)

        throw new Error(
          data?.detail ||
            'No se pudo descargar el documento',
        )
      }

      const blob =
        await response.blob()

      const downloadUrl =
        window.URL.createObjectURL(blob)

      const link =
        document.createElement('a')

      link.href = downloadUrl
      link.download =
        getDocumentName(contract)

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(
        downloadUrl,
      )
    } catch (err) {
      setContractsError(
        err.message,
      )
    }
  }

  async function handleUploadDocument(
    contract,
    employeeId,
    file,
  ) {
    const token = localStorage.getItem(
      'access_token',
    )

    if (!token) {
      setContractsError(
        'No hay una sesion valida',
      )
      return
    }

    if (!file) {
      setContractsError(
        'Selecciona un archivo PDF',
      )
      return
    }

    if (file.type !== 'application/pdf') {
      setContractsError(
        'El archivo debe ser un PDF',
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

      const url =
        API_URL +
        '/api/employees/' +
        employeeId +
        '/contracts/' +
        contract.id +
        '/document'

      const response = await fetch(
        url,
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
            'No se pudo subir el documento',
        )
      }

      setSelectedFiles(
        (previous) => {
          const updated = {
            ...previous,
          }

          delete updated[
            contract.id
          ]

          return updated
        },
      )

      await loadContracts(
        employeeId,
        token,
      )
    } catch (err) {
      setContractsError(
        err.message,
      )
    }
  }

  async function handleDownloadNomina(
    nomina,
    employeeId = null,
  ) {
    const token = localStorage.getItem(
      'access_token',
    )

    if (!token) {
      setNominasError(
        'No hay una sesion valida',
      )
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
          Authorization:
            'Bearer ' + token,
        },
      })

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null)

        throw new Error(
          data?.detail ||
            'No se pudo descargar la nomina',
        )
      }

      const blob =
        await response.blob()

      const downloadUrl =
        window.URL.createObjectURL(blob)

      const link =
        document.createElement('a')

      link.href = downloadUrl
      link.download =
        getNominaDocumentName(nomina)

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(
        downloadUrl,
      )
    } catch (err) {
      setNominasError(
        err.message,
      )
    }
  }

  async function handleUploadNominaDocument(
    nomina,
    employeeId,
    file,
  ) {
    const token = localStorage.getItem(
      'access_token',
    )

    if (!token) {
      setNominasError(
        'No hay una sesion valida',
      )
      return
    }

    if (!file) {
      setNominasError(
        'Selecciona un archivo PDF',
      )
      return
    }

    if (file.type !== 'application/pdf') {
      setNominasError(
        'El archivo debe ser un PDF',
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

      const url =
        API_URL +
        '/api/employees/' +
        employeeId +
        '/nominas/' +
        nomina.id +
        '/document'

      const response = await fetch(
        url,
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
            'No se pudo subir la nomina',
        )
      }

      setSelectedNominaFiles(
        (previous) => {
          const updated = {
            ...previous,
          }

          delete updated[
            nomina.id
          ]

          return updated
        },
      )

      await loadNominas(
        employeeId,
        token,
      )
    } catch (err) {
      setNominasError(
        err.message,
      )
    }
  }

  function getDocumentName(contract) {
    if (contract.document_path) {
      const normalizedPath =
        contract.document_path.replaceAll(
          '\\',
          '/',
        )

      const parts =
        normalizedPath.split('/')

      return (
        parts[parts.length - 1] ||
        'contrato-' +
          contract.id +
          '.pdf'
      )
    }

    return (
      'contrato-' +
      contract.id +
      '.pdf'
    )
  }

  function getNominaDocumentName(nomina) {
    if (nomina.document_path) {
      const normalizedPath =
        nomina.document_path.replaceAll(
          '\\',
          '/',
        )

      const parts =
        normalizedPath.split('/')

      return (
        parts[parts.length - 1] ||
        'nomina-' +
          nomina.id +
          '.pdf'
      )
    }

    return (
      'nomina-' +
      nomina.id +
      '.pdf'
    )
  }

  function formatDate(value) {
    if (!value) {
      return 'Sin fecha'
    }

    const parts =
      value.split('-')

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

  function handleLogout() {
    localStorage.removeItem(
      'access_token',
    )

    setUser(null)
    setContracts([])
    setNominas([])
    setEmployees([])
    setSelectedEmployee(null)
    setSelectedFiles({})
    setSelectedNominaFiles({})
    setEmployeeSection('contracts')

    setContractsError('')
    setNominasError('')
    setEmployeesError('')

    setLoggedIn(false)

    setUsername('')
    setPassword('')
  }

  if (loggedIn && user) {
    if (user.role === 'HR') {
      return (
        <main className="app">
          <section className="card">
            <div className="header">
              <div>
                <p className="eyebrow">
                  Portal Laboraltus
                </p>

                <h1>
                  Panel de RR. HH.
                </h1>

                <p>
                  Bienvenido,{' '}
                  {user.username}
                </p>
              </div>

              <button
                type="button"
                className="secondary"
                onClick={
                  handleLogout
                }
              >
                Cerrar sesion
              </button>
            </div>

            <div className="contracts">
              <div className="section-header">
                <div>
                  <p className="eyebrow">
                    Gestion de personal
                  </p>

                  <h2>
                    Empleados
                  </h2>
                </div>

                {!employeesLoading &&
                  employees.length >
                    0 && (
                    <span className="contract-count">
                      {employees.length}{' '}
                      {employees.length ===
                      1
                        ? 'empleado'
                        : 'empleados'}
                    </span>
                  )}
              </div>

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
                employees.length ===
                  0 && (
                  <div className="empty-state">
                    <strong>
                      No hay empleados
                    </strong>

                    <p>
                      No se encontraron
                      empleados en el
                      sistema.
                    </p>
                  </div>
                )}

              {!employeesLoading &&
                employees.length >
                  0 && (
                  <div className="contract-list">
                    {employees.map(
                      (employee) => (
                        <article
                          className="contract-card"
                          key={
                            employee.id
                          }
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
                                  employee.job_title
                                }
                              </strong>
                            </div>

                            <div>
                              <span>
                                Categoria
                              </span>

                              <strong>
                                {
                                  employee.job_category
                                }
                              </strong>
                            </div>
                          </div>

                          <div className="contract-document">
                            <button
                              type="button"
                              className="download-button"
                              onClick={() =>
                                handleSelectEmployee(
                                  employee,
                                )
                              }
                            >
                              Ver contratos
                            </button>

                            <button
                              type="button"
                              className="download-button"
                              onClick={() =>
                                handleViewNominas(
                                  employee,
                                )
                              }
                            >
                              Ver nominas
                            </button>
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                )}
            </div>

            {selectedEmployee &&
              employeeSection ===
                'contracts' && (
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
                    onClick={() => {
                      setSelectedEmployee(
                        null,
                      )
                      setContracts([])
                      setSelectedFiles({})
                      setContractsError(
                        '',
                      )
                    }}
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
                    {
                      contractsError
                    }
                  </p>
                )}

                {!contractsLoading &&
                  !contractsError &&
                  contracts.length ===
                    0 && (
                  <div className="empty-state">
                    <strong>
                      No hay contratos
                    </strong>

                    <p>
                      Este empleado
                      todavía no tiene
                      contratos
                      asociados.
                    </p>
                  </div>
                )}

                {!contractsLoading &&
                  contracts.length >
                    0 && (
                  <div className="contract-list">
                    {contracts.map(
                      (contract) => (
                        <article
                          className="contract-card"
                          key={
                            contract.id
                          }
                        >
                          <div className="contract-info">
                            <div>
                              <span>
                                Tipo de
                                contrato
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
                            {contract.document_path && (
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
                                documento
                              </button>
                            )}

                            <input
                              id={
                                'contract-file-' +
                                contract.id
                              }
                              type="file"
                              accept="application/pdf"
                              style={{
                                display: 'none',
                              }}
                              onChange={(
                                event,
                              ) => {
                                const file =
                                  event.target.files?.[0]

                                if (file) {
                                  if (
                                    file.type !==
                                    'application/pdf'
                                  ) {
                                    setContractsError(
                                      'El archivo debe ser un PDF',
                                    )
                                  } else {
                                    setContractsError(
                                      '',
                                    )

                                    setSelectedFiles(
                                      (previous) => ({
                                        ...previous,
                                        [contract.id]:
                                          file,
                                      }),
                                    )
                                  }
                                }

                                event.target.value =
                                  ''
                              }}
                            />

                            <label
                              htmlFor={
                                'contract-file-' +
                                contract.id
                              }
                              className="download-button upload-file-label"
                            >
                              Seleccionar PDF
                            </label>

                            {selectedFiles[
                              contract.id
                            ] && (
                              <button
                                type="button"
                                className="download-button"
                                onClick={() =>
                                  handleUploadDocument(
                                    contract,
                                    selectedEmployee.id,
                                    selectedFiles[
                                      contract.id
                                    ],
                                  )
                                }
                              >
                                Subir documento
                              </button>
                            )}
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedEmployee &&
              employeeSection ===
                'nominas' && (
              <div className="contracts">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">
                      Documentacion laboral
                    </p>

                    <h2>
                      Nominas de{' '}
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
                    onClick={() => {
                      setSelectedEmployee(
                        null,
                      )
                      setNominas([])
                      setSelectedNominaFiles({})
                      setNominasError(
                        '',
                      )
                    }}
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
                    {
                      nominasError
                    }
                  </p>
                )}

                {!nominasLoading &&
                  !nominasError &&
                  nominas.length ===
                    0 && (
                  <div className="empty-state">
                    <strong>
                      No hay nominas
                    </strong>

                    <p>
                      Este empleado
                      todavía no tiene
                      nominas
                      asociadas.
                    </p>
                  </div>
                )}

                {!nominasLoading &&
                  nominas.length >
                    0 && (
                  <div className="contract-list">
                    {nominas.map(
                      (nomina) => (
                        <article
                          className="contract-card"
                          key={
                            nomina.id
                          }
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
                            {nomina.document_path && (
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
                                documento
                              </button>
                            )}

                            <input
                              id={
                                'nomina-file-' +
                                nomina.id
                              }
                              type="file"
                              accept="application/pdf"
                              style={{
                                display: 'none',
                              }}
                              onChange={(
                                event,
                              ) => {
                                const file =
                                  event.target.files?.[0]

                                if (file) {
                                  if (
                                    file.type !==
                                    'application/pdf'
                                  ) {
                                    setNominasError(
                                      'El archivo debe ser un PDF',
                                    )
                                  } else {
                                    setNominasError(
                                      '',
                                    )

                                    setSelectedNominaFiles(
                                      (previous) => ({
                                        ...previous,
                                        [nomina.id]:
                                          file,
                                      }),
                                    )
                                  }
                                }

                                event.target.value =
                                  ''
                              }}
                            />

                            <label
                              htmlFor={
                                'nomina-file-' +
                                nomina.id
                              }
                              className="download-button upload-file-label"
                            >
                              Seleccionar PDF
                            </label>

                            {selectedNominaFiles[
                              nomina.id
                            ] && (
                              <button
                                type="button"
                                className="download-button"
                                onClick={() =>
                                  handleUploadNominaDocument(
                                    nomina,
                                    selectedEmployee.id,
                                    selectedNominaFiles[
                                      nomina.id
                                    ],
                                  )
                                }
                              >
                                Subir documento
                              </button>
                            )}
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      )
    }

    return (
      <main className="app">
        <section className="card">
          <div className="header">
            <div>
              <p className="eyebrow">
                Portal Laboraltus
              </p>

              <h1>
                Bienvenido,{' '}
                {user.first_name}
              </h1>
            </div>

            <button
              type="button"
              className="secondary"
              onClick={
                handleLogout
              }
            >
              Cerrar sesion
            </button>
          </div>

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
                contracts.length >
                  0 && (
                  <span className="contract-count">
                    {contracts.length}{' '}
                    {contracts.length ===
                    1
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
              contracts.length ===
                0 && (
                <div className="empty-state">
                  <strong>
                    No hay contratos
                    disponibles
                  </strong>

                  <p>
                    Todavia no hay
                    contratos asociados
                    a tu perfil.
                  </p>
                </div>
              )}

            {!contractsLoading &&
              contracts.length >
                0 && (
                <div className="contract-list">
                  {contracts.map(
                    (contract) => (
                      <article
                        className="contract-card"
                        key={
                          contract.id
                        }
                      >
                        <div className="contract-info">
                          <div>
                            <span>
                              Tipo de
                              contrato
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
                              Descargar
                              documento
                            </button>
                          ) : (
                            <span className="no-document">
                              Documento no
                              disponible
                            </span>
                          )}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              )}
          </div>

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
                nominas.length >
                  0 && (
                  <span className="contract-count">
                    {nominas.length}{' '}
                    {nominas.length ===
                    1
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
              nominas.length ===
                0 && (
                <div className="empty-state">
                  <strong>
                    No hay nominas
                    disponibles
                  </strong>

                  <p>
                    Todavia no hay
                    nominas asociadas
                    a tu perfil.
                  </p>
                </div>
              )}

            {!nominasLoading &&
              nominas.length >
                0 && (
                <div className="contract-list">
                  {nominas.map(
                    (nomina) => (
                      <article
                        className="contract-card"
                        key={
                          nomina.id
                        }
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
                              Descargar
                              documento
                            </button>
                          ) : (
                            <span className="no-document">
                              Documento no
                              disponible
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
            Inicia sesion para
            acceder a tu
            informacion.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
        >
          <label htmlFor="username">
            Usuario
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value,
              )
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
              setPassword(
                event.target.value,
              )
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