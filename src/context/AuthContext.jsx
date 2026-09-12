import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/features/auth/services/auth.service'

// ─── Context ──────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ─── Storage keys ─────────────────────────────────────────────────────────
const TOKEN_KEY = 'creatorske_token'
const USER_KEY  = 'creatorske_user'

// ─── Provider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [user,  setUser]  = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Derived - role comes from the user object
  const role = user?.role ?? null

  // ── login ────────────────────────────────────────────────────────────────
  const login = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  // ── logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    // Best-effort - revoke the session server-side, but don't block clearing
    // local state on it (the token may already be expired/invalid).
    authService.logout().catch(() => {})
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  // ── updateUser - for profile edits that don't change the token ───────────
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // ── isAuthenticated ───────────────────────────────────────────────────────
  const isAuthenticated = Boolean(token && user)

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAuthenticated,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}

export default AuthContext
