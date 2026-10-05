import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function getInitials(name) {
  if (!name) return '?'
  return name
    .trim()
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function CitizenNavbar({ user: propUser, onLogout: propLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const user = propUser || auth?.user
  const handleLogout = propLogout || (() => {
    auth?.logout?.()
    navigate('/login', { replace: true })
  })

  const pathname = location.pathname

  const navLinks = [
    {
      label: 'Dashboard',
      href: '/citizen',
      isActive: pathname === '/citizen',
    },
    {
      label: 'My Issues',
      href: '/my-issues',
      isActive: pathname === '/my-issues' || pathname === '/citizen/issues',
    },
  ]

  return (
    <>
      <nav className="cz-nav" role="navigation" aria-label="Citizen navigation">
        <div className="cz-nav-inner">
          {/* Brand */}
          <a
            className="cz-nav-brand"
            href="/citizen"
            onClick={(e) => {
              e.preventDefault()
              navigate('/citizen')
            }}
          >
            <div className="cz-nav-logo-mark" aria-hidden="true">
              ⚡
            </div>
            <span className="cz-nav-brand-name">
              Civic<span className="cz-nav-brand-dot">Flow</span>
            </span>
          </a>

          {/* Desktop nav links */}
          <ul className="cz-nav-links" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`cz-nav-link${link.isActive ? ' active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(link.href)
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* User area */}
          <div className="cz-nav-user">
            <div
              className="cz-nav-avatar"
              aria-label={`Signed in as ${user?.name || 'Citizen'}`}
              title={user?.name || 'Citizen'}
            >
              {getInitials(user?.name)}
            </div>
            <span className="cz-nav-username">{user?.name || 'Citizen'}</span>
            <button
              id="nav-logout-btn"
              type="button"
              className="cz-nav-logout"
              onClick={handleLogout}
            >
              Sign out
            </button>

            {/* Mobile hamburger */}
            <button
              id="nav-hamburger-btn"
              type="button"
              className="cz-nav-hamburger"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`cz-nav-mobile${mobileOpen ? ' open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        {navLinks.map((link) => (
          <button
            key={link.href}
            type="button"
            className={`cz-nav-mobile-link${link.isActive ? ' active' : ''}`}
            onClick={() => {
              navigate(link.href)
              setMobileOpen(false)
            }}
          >
            {link.label}
          </button>
        ))}
        <div className="cz-nav-mobile-divider" />
        <button
          type="button"
          className="cz-nav-mobile-link"
          onClick={() => {
            handleLogout()
            setMobileOpen(false)
          }}
        >
          Sign out
        </button>
      </div>
    </>
  )
}

export default CitizenNavbar
