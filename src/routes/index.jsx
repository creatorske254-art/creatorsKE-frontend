import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { IconLoader2 } from '@tabler/icons-react'
import ProtectedRoute from './ProtectedRoute'

// ── Layouts ────────────────────────────────────────────────────────────────
import PublicLayout     from '@/components/layouts/PublicLayout'
import AuthLayout       from '@/components/layouts/AuthLayout'
import OnboardingLayout from '@/components/layouts/OnboardingLayout'
import CreatorLayout    from '@/components/layouts/CreatorLayout'
import BrandLayout      from '@/components/layouts/BrandLayout'
import AdminLayout      from '@/components/layouts/AdminLayout'

// ── Public pages ──────────────────────────────────────────────────────────
const HomePage = lazy(() => import('@/pages/public/HomePage'))
const DirectoryPage = lazy(() => import('@/pages/public/DirectoryPage'))
const PricingPage = lazy(() => import('@/pages/public/PricingPage'))
const RateCardPage = lazy(() => import('@/pages/public/RateCardPage'))
const PortfolioPage = lazy(() => import('@/pages/public/PortfolioPage'))
const TermsPage = lazy(() => import('@/pages/public/TermsPage'))
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage'))

// ── Error pages ───────────────────────────────────────────────────────────
import NotFoundPage   from '@/pages/error/NotFoundPage'
import ServerErrorPage from '@/pages/error/ServerErrorPage'

// ── Auth pages ────────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const SignUpPage = lazy(() => import('@/pages/auth/SignUpPage'))
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))

// ── Onboarding pages ──────────────────────────────────────────────────────
const PlanSelectionPage = lazy(() => import('@/pages/onboarding/PlanSelectionPage'))

// ── Creator pages ─────────────────────────────────────────────────────────
const CreatorDashboardPage = lazy(() => import('@/pages/creator/DashboardPage'))
const RateCardBuilderPage = lazy(() => import('@/pages/creator/RateCardBuilderPage'))
const PortfolioBuilderPage = lazy(() => import('@/pages/creator/PortfolioBuilderPage'))
const CreatorEnquiriesPage = lazy(() => import('@/pages/creator/EnquiriesPage'))
const MoneyPage = lazy(() => import('@/pages/creator/MoneyPage'))
const CreatorSettingsPage = lazy(() => import('@/pages/creator/SettingsPage'))

// ── Brand pages ───────────────────────────────────────────────────────────
const BrandDashboardPage = lazy(() => import('@/pages/brand/DashboardPage'))
const CampaignsPage = lazy(() => import('@/pages/brand/CampaignsPage'))
const CampaignDetailPage = lazy(() => import('@/pages/brand/CampaignDetailPage'))
const ShortlistPage = lazy(() => import('@/pages/brand/ShortlistPage'))
const BrandSettingsPage = lazy(() => import('@/pages/brand/SettingsPage'))
const BrandEnquiriesPage = lazy(() => import('@/pages/brand/EnquiriesPage'))
const BrandBillingPage = lazy(() => import('@/pages/brand/BillingPage'))
const BrandTransactionsPage = lazy(() => import('@/pages/brand/TransactionsPage'))

// ── Admin pages ───────────────────────────────────────────────────────────
const AdminOverviewPage = lazy(() => import('@/pages/admin/OverviewPage'))
const AdminDisputesPage = lazy(() => import('@/pages/admin/DisputesPage'))
const AdminAccountsPage = lazy(() => import('@/pages/admin/AccountsPage'))
const AdminReviewsPage = lazy(() => import('@/pages/admin/ReviewsPage'))
const AdminEscrowPage = lazy(() => import('@/pages/admin/EscrowPage'))
const AdminDeletionRequestsPage = lazy(() => import('@/pages/admin/DeletionRequestsPage'))
const AdminReEngagementPage = lazy(() => import('@/pages/admin/ReEngagementPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage'))

// Shared
const NotificationsPage = lazy(() => import('@/pages/shared/NotificationsPage'))

// Pages load on demand, so a visitor downloads only the screens they open (the layouts and the
// error pages stay in the main bundle). This is what shows while a page's code arrives.
function PageLoading() {
  return (
    <div role="status" style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-8)', color: 'var(--grey-500)', fontSize: 13 }}>
      <IconLoader2 className="icon-sm" style={{ animation: 'spin 0.8s linear infinite' }} aria-hidden="true" />
      Loading
    </div>
  )
}
const page = (Page) => (
  <Suspense fallback={<PageLoading />}>
    <Page />
  </Suspense>
)

// ─────────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([

  // ── Public ──────────────────────────────────────────────────────────────
  {
    element: <PublicLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      { index: true,                    element: page(HomePage) },
      { path: 'directory',              element: page(DirectoryPage) },
      { path: 'pricing',                element: page(PricingPage) },
      { path: 'c/:handle',              element: page(RateCardPage) },
      { path: 'c/:handle/portfolio',    element: page(PortfolioPage) },
      { path: 'terms',                  element: page(TermsPage) },
      { path: 'privacy',                element: page(PrivacyPage) },
    ],
  },

  // ── Auth ────────────────────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      { path: 'login',                  element: page(LoginPage) },
      { path: 'signup',                 element: page(SignUpPage) },
      { path: 'verify-email',           element: page(VerifyEmailPage) },
      { path: 'reset-password',         element: page(ResetPasswordPage) },
    ],
  },

  // ── Onboarding (creator only) ────────────────────────────────────────────
  {
    element: <ProtectedRoute requiredRole="creator" />,
    errorElement: <ServerErrorPage />,
    children: [
      {
        element: <OnboardingLayout />,
        children: [
          { path: 'onboarding',         element: <Navigate to="/onboarding/plan" replace /> },
          { path: 'onboarding/plan',    element: page(PlanSelectionPage) },
        ],
      },
    ],
  },

  // ── Creator dashboard ────────────────────────────────────────────────────
  {
    element: <ProtectedRoute requiredRole="creator" />,
    errorElement: <ServerErrorPage />,
    children: [
      {
        element: <CreatorLayout />,
        children: [
          { path: 'creator/dashboard',  element: page(CreatorDashboardPage) },
          { path: 'creator/rate-card',          element: page(RateCardBuilderPage) },
          { path: 'creator/rate-card/:id/edit', element: page(RateCardBuilderPage) },
          { path: 'creator/portfolio',  element: page(PortfolioBuilderPage) },
          { path: 'creator/enquiries',  element: page(CreatorEnquiriesPage) },
          { path: 'creator/money',      element: page(MoneyPage) },
          { path: 'creator/settings',   element: page(CreatorSettingsPage) },
          { path: 'creator/notifications', element: page(NotificationsPage) },
        ],
      },
    ],
  },

  // ── Brand dashboard ──────────────────────────────────────────────────────
  {
    element: <ProtectedRoute requiredRole="brand" />,
    errorElement: <ServerErrorPage />,
    children: [
      {
        element: <BrandLayout />,
        children: [
          { path: 'brand/dashboard',    element: page(BrandDashboardPage) },
          { path: 'brand/enquiries',    element: page(BrandEnquiriesPage) },
          { path: 'brand/campaigns',    element: page(CampaignsPage) },
          { path: 'brand/campaigns/:id',element: page(CampaignDetailPage) },
          { path: 'brand/shortlist',    element: page(ShortlistPage) },
          { path: 'brand/settings',     element: page(BrandSettingsPage) },
          { path: 'brand/billing',      element: page(BrandBillingPage) },
          { path: 'brand/transactions', element: page(BrandTransactionsPage) },
          { path: 'brand/notifications', element: page(NotificationsPage) },
        ],
      },
    ],
  },

  // ── Admin ────────────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute requiredRole="admin" />,
    errorElement: <ServerErrorPage />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'admin',              element: page(AdminOverviewPage) },
          { path: 'admin/disputes',     element: page(AdminDisputesPage) },
          { path: 'admin/accounts',     element: page(AdminAccountsPage) },
          { path: 'admin/reviews',      element: page(AdminReviewsPage) },
          { path: 'admin/escrow',       element: page(AdminEscrowPage) },
          { path: 'admin/deletion-requests', element: page(AdminDeletionRequestsPage) },
          { path: 'admin/re-engagement', element: page(AdminReEngagementPage) },
          { path: 'admin/settings',     element: page(AdminSettingsPage) },
          { path: 'admin/notifications', element: page(NotificationsPage) },
        ],
      },
    ],
  },

  // ── Fallback (404) ───────────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}