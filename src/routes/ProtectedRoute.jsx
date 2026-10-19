import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/features/auth/services/auth.service'

// Role → default redirect map
const ROLE_HOME = {
  creator: '/creator/dashboard',
  brand:   '/brand/dashboard',
  admin:   '/admin',
}

/**
 * ProtectedRoute
 *
 * Usage in routes/index.jsx:
 *   <Route element={<ProtectedRoute requiredRole="creator" />}>
 *     <Route path="/creator/dashboard" element={<DashboardPage />} />
 *   </Route>
 *
 * - No token → redirect to /login
 * - Wrong role → redirect to the user's correct home
 * - Correct role → render <Outlet />
 */
export default function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, role, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const callbackToken = params.get('token') || params.get('access_token')
  const isSocialCallback = location.pathname === '/creator/portfolio' && params.has('verified')
  const isHydratingSocialCallback = isSocialCallback && !!callbackToken

  useEffect(() => {
    if (!isHydratingSocialCallback) return undefined
    let cancelled = false

    async function completeSocialLogin() {
      try {
        const user = await authService.getCurrentUser(callbackToken)
        if (!user?.role) throw new Error('The social sign-in did not return a valid account.')
        if (cancelled) return

        login(callbackToken, user)
        const cleanParams = new URLSearchParams(location.search)
        cleanParams.delete('token')
        cleanParams.delete('access_token')
        const search = cleanParams.toString()
        navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true })
      } catch (err) {
        if (cancelled) return
        toast.error(err?.message || 'Could not complete social sign-in.')
        navigate('/login', { replace: true })
      }
    }

    completeSocialLogin()
    return () => { cancelled = true }
  }, [callbackToken, isHydratingSocialCallback, location.pathname, location.search, login, navigate])

  if (isHydratingSocialCallback) {
    return (
      <div role="status" style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--grey-500)', fontSize: 13 }}>
        Completing social sign-in…
      </div>
    )
  }

  // Not logged in at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role
  if (requiredRole && role !== requiredRole) {
    const correctHome = ROLE_HOME[role] || '/login'
    return <Navigate to={correctHome} replace />
  }

  return <Outlet />
}