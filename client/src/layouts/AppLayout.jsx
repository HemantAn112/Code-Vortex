import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AppLayout({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-brand">
          <strong>CivicFlow</strong>
          <span className="app-role-badge">{role}</span>
        </div>
        {user && (
          <div className="app-header-user">
            <span className="user-name">{user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        )}
      </header>
      <Outlet />
    </div>
  )
}

export default AppLayout

