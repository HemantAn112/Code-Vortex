import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, getRoleDashboardPath } from '../context/AuthContext'

function RoleRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-loading-state">
        <p>Verifying access...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    const safeDashboard = getRoleDashboardPath(user.role)
    return <Navigate to={safeDashboard} replace />
  }

  return <Outlet />
}

export default RoleRoute

