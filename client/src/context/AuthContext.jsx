import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { getRoleDashboardPath } from '../utils/roleUtils'

export const AuthContext = createContext(null)

const TOKEN_KEY = 'civicflow_token'

export { getRoleDashboardPath }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/auth/me')
        if (response.data?.success && response.data?.user) {
          setUser(response.data.user)
          setToken(storedToken)
        } else {
          localStorage.removeItem(TOKEN_KEY)
          setUser(null)
          setToken(null)
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
      })

      if (response.data?.success) {
        const { token: receivedToken, user: receivedUser } = response.data
        localStorage.setItem(TOKEN_KEY, receivedToken)
        setToken(receivedToken)
        setUser(receivedUser)
        return receivedUser
      }

      throw new Error(response.data?.message || 'Login failed')
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.request && !error.response
          ? 'Unable to connect to server'
          : error.message || 'Login failed')
      throw new Error(message)
    }
  }

  const register = async (name, email, password, role = 'CITIZEN') => {
    try {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      })

      if (response.data?.success) {
        const { token: receivedToken, user: receivedUser } = response.data
        localStorage.setItem(TOKEN_KEY, receivedToken)
        setToken(receivedToken)
        setUser(receivedUser)
        return receivedUser
      }

      throw new Error(response.data?.message || 'Registration failed')
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.request && !error.response
          ? 'Unable to connect to server'
          : error.message || 'Registration failed')
      throw new Error(message)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
