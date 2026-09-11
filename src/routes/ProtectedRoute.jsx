import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

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
  const { isAuthenticated, role } = useAuth()

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