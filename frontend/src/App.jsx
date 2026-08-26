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

  async function loadContracts(employeeId, token) {
    setContractsLoading(true)
    setContractsError('')

    try {
      const response = await fetch(
        `${API_URL}/api/employees/${employeeId}/contracts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'No se pudieron cargar los contratos')
      }

      setContracts(Array.isArray(data) ? data : [data])
    } catch (err) {
      setContractsError(err.message)
    } finally {
      setContractsLoading(false)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'No se pudo iniciar sesion')
      }

      localStorage.setItem('access_token', data.access_token)

      const meResponse = await fetch(`${API_URL}/api/me`, {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      })

      if (!meResponse.ok) {
        throw new Error('No se pudo cargar el perfil')
      }

      const me = await meResponse.json()

      const loggedUser = {
        ...me,
        role: data.role,
      }

      setUser(loggedUser)
      setLoggedIn(true)

      await loadContracts(me.id, data.access_token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(contract) {
    const token = localStorage.getItem('access_token')

    if (!token || !user) {
      setContractsError('No hay una sesion valida')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/employees/${user.id}/contracts/${contract.id}/document`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(
          data?.detail || 'No se pudo descargar el documento',
        )
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = getDocumentName(contract)
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (err) {
      setContractsError(err.message)
    }
  }

  function getDocumentName(contract) {
    if (contract.document_path) {
      const normalizedPath = contract.document_path.replaceAll('\\', '/')
      const parts = normalizedPath.split('/')
      return parts[parts.length - 1] || `contrato-${contract.id}`
    }

    return `contrato-${contract.id}`
  }

  function formatDate(value) {
    if (!value) {
      return 'Sin fecha'
    }

    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
  }

  function handleLogout() {
    localStorage.removeItem('access_token')
    setUser(null)
    setContracts([])
    setContractsError('')
    setLoggedIn(false)
    setUsername('')
    setPassword('')
  }

  if (loggedIn && user) {
    return (
      <main className="app">
        <section className="card">
          <div className="header">
            <div>
              <p className="eyebrow">Proyecto Learning</p>
              <h1>Bienvenido, {user.first_name}</h1>
            </div>

            <button type="button" className="secondary" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </div>

          <div className="profile">
            <h2>Mi perfil</h2>

            <div className="profile-grid">
              <div>
                <span>Nombre</span>
                <strong>
                  {user.first_name} {user.last_name}
                </strong>
              </div>

              <div>
                <span>Usuario</span>
                <strong>{username}</strong>
              </div>

              <div>
                <span>Rol</span>
                <strong>{user.role}</strong>
              </div>

              <div>
                <span>Puesto</span>
                <strong>{user.job_title}</strong>
              </div>

              <div>
                <span>Categoria</span>
                <strong>{user.job_category}</strong>
              </div>

              <div>
                <span>Nacionalidad</span>
                <strong>{user.nationality}</strong>
              </div>
            </div>
          </div>

          <div className="contracts">
            <div className="section-header">
              <div>
                <p className="eyebrow">Documentacion laboral</p>
                <h2>Mis contratos</h2>
              </div>

              {!contractsLoading && contracts.length > 0 && (
                <span className="contract-count">
                  {contracts.length}{' '}
                  {contracts.length === 1 ? 'contrato' : 'contratos'}
                </span>
              )}
            </div>

            {contractsLoading && (
              <p className="muted">Cargando contratos...</p>
            )}

            {!contractsLoading && contractsError && (
              <p className="error">{contractsError}</p>
            )}

            {!contractsLoading &&
              !contractsError &&
              contracts.length === 0 && (
                <div className="empty-state">
                  <strong>No hay contratos disponibles</strong>
                  <p>
                    Todavia no hay contratos asociados a tu perfil.
                  </p>
                </div>
              )}

            {!contractsLoading &&
              contracts.length > 0 && (
                <div className="contract-list">
                  {contracts.map((contract) => (
                    <article className="contract-card" key={contract.id}>
                      <div className="contract-info">
                        <div>
                          <span>Tipo de contrato</span>
                          <strong>{contract.contract_type}</strong>
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
                        {contract.document_path ? (
                          <button
                            type="button"
                            className="download-button"
                            onClick={() => handleDownload(contract)}
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
                  ))}
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
          <p className="eyebrow">Proyecto Learning</p>
          <h1>Portal del empleado</h1>
          <p>Inicia sesion para acceder a tu informacion.</p>
        </div>

        <form onSubmit={handleLogin}>
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Introduce tu usuario"
            autoComplete="username"
            required
          />

          <label htmlFor="password">Contrasena</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Introduce tu contrasena"
            autoComplete="current-password"
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando sesion...' : 'Iniciar sesion'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default App