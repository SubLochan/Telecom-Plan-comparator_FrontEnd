import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import {
  saveToken, removeToken,
  getActiveUsername, clearActiveSession,
  getActiveToken, getSavedSessions, switchSession, getToken,
} from '../services/session'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false

  // On mount: restore whatever session is active for this tab
  useEffect(() => {
    const token = getActiveToken()
    if (token) {
      authService.getMe()
        .then(setUser)
        .catch(() => {
          // Token invalid / expired — clear just this session
          const username = getActiveUsername()
          removeToken(username)
          clearActiveSession()
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // ── Login: store token under this username's key ─────────────────
  const login = useCallback(async (username, password) => {
    const data = await authService.login(username, password)
    if (!data?.token) throw new Error('Login failed: no token received')
    saveToken(data.username, data.token)          // sf_token_<username>
    setUser({ id: data.id, username: data.username, email: data.email, roles: data.roles })
    return data
  }, [])

  // ── Logout: remove only this user's token, keep others ───────────
  const logout = useCallback(() => {
    const username = getActiveUsername()
    removeToken(username)
    clearActiveSession()
    setUser(null)
  }, [])

  // ── Register ─────────────────────────────────────────────────────
  const register = useCallback(
    (username, email, password) => authService.register(username, email, password),
    []
  )

  // ── Switch session (already-logged-in user in this browser) ──────
  const switchToSession = useCallback(async (username) => {
    const ok = switchSession(username)
    if (!ok) return false
    setLoading(true)
    try {
      const me = await authService.getMe()
      setUser(me)
      return true
    } catch {
      removeToken(username)
      clearActiveSession()
      setUser(null)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ── List saved sessions (other users already logged in) ──────────
  const savedSessions = getSavedSessions().filter(u => {
    // only include users that have a valid token stored and aren't the current user
    return u !== user?.username && !!getToken(u)
  })

  return (
    <AuthContext.Provider value={{
      user, loading, isAdmin,
      login, logout, register,
      switchToSession, savedSessions,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
