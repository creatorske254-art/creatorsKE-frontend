import { createContext, useContext, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
  // Cached queries belong to whoever was signed in (keys like ['profile'] are not per user), so
  // they are dropped whenever the account changes; otherwise the next person on a shared
  // browser could see the previous account's data until it refetched.
  const queryClient = useQueryClient()

  const login = useCallback((newToken, newUser) => {
    queryClient.clear()
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [queryClient])

  // ── logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    // Best-effort - revoke the session server-side, but don't block clearing
    // local state on it (the token may already be expired/invalid).
    authService.logout().catch(() => {})
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    queryClient.clear()
  }, [queryClient])

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
