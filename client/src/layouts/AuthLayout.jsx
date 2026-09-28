import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <strong>CivicFlow</strong>
      </header>
      <Outlet />
    </div>
  )
}

export default AuthLayout
