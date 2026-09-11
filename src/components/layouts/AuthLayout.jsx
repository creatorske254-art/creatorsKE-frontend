import { Outlet } from 'react-router-dom'

// Intentionally minimal — Login/SignUp/ResetPassword/VerifyEmail each build
// their own full nav/card layout inline.
export default function AuthLayout() {
  return <Outlet />
}
