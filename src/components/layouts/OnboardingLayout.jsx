import { Outlet } from 'react-router-dom'

// Intentionally minimal — OnboardingPage/PlanSelectionPage build their own
// full-page layout inline.
export default function OnboardingLayout() {
  return <Outlet />
}
