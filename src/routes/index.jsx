import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

// ── Layouts ────────────────────────────────────────────────────────────────
import PublicLayout     from '@/components/layouts/PublicLayout'
import AuthLayout       from '@/components/layouts/AuthLayout'
import OnboardingLayout from '@/components/layouts/OnboardingLayout'
import CreatorLayout    from '@/components/layouts/CreatorLayout'
import BrandLayout      from '@/components/layouts/BrandLayout'
import AdminLayout      from '@/components/layouts/AdminLayout'

// ── Public pages ──────────────────────────────────────────────────────────
import HomePage      from '@/pages/public/HomePage'
import DirectoryPage from '@/pages/public/DirectoryPage'
import PricingPage   from '@/pages/public/PricingPage'
import RateCardPage  from '@/pages/public/RateCardPage'
import PortfolioPage from '@/pages/public/PortfolioPage'
import TermsPage     from '@/pages/public/TermsPage'
import PrivacyPage   from '@/pages/public/PrivacyPage'

// ── Error pages ───────────────────────────────────────────────────────────
import NotFoundPage   from '@/pages/error/NotFoundPage'
import ServerErrorPage from '@/pages/error/ServerErrorPage'

// ── Auth pages ────────────────────────────────────────────────────────────
import LoginPage         from '@/pages/auth/LoginPage'
import SignUpPage        from '@/pages/auth/SignUpPage'
import VerifyEmailPage   from '@/pages/auth/VerifyEmailPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// ── Onboarding pages ──────────────────────────────────────────────────────
import PlanSelectionPage from '@/pages/onboarding/PlanSelectionPage'

// ── Creator pages ─────────────────────────────────────────────────────────
import CreatorDashboardPage      from '@/pages/creator/DashboardPage'
import RateCardBuilderPage       from '@/pages/creator/RateCardBuilderPage'
import PortfolioBuilderPage      from '@/pages/creator/PortfolioBuilderPage'
import CreatorEnquiriesPage      from '@/pages/creator/EnquiriesPage'
import MoneyPage                 from '@/pages/creator/MoneyPage'
import CreatorSettingsPage       from '@/pages/creator/SettingsPage'

// ── Brand pages ───────────────────────────────────────────────────────────
import BrandDashboardPage   from '@/pages/brand/DashboardPage'
import CampaignsPage        from '@/pages/brand/CampaignsPage'
import CampaignDetailPage   from '@/pages/brand/CampaignDetailPage'
import ShortlistPage        from '@/pages/brand/ShortlistPage'
import BrandSettingsPage    from '@/pages/brand/SettingsPage'
import BrandEnquiriesPage   from '@/pages/brand/EnquiriesPage'
import BrandBillingPage     from '@/pages/brand/BillingPage'
import BrandTransactionsPage from '@/pages/brand/TransactionsPage'

// ── Admin pages ───────────────────────────────────────────────────────────
import AdminOverviewPage  from '@/pages/admin/OverviewPage'
import AdminDisputesPage  from '@/pages/admin/DisputesPage'
import AdminAccountsPage  from '@/pages/admin/AccountsPage'
import AdminReviewsPage   from '@/pages/admin/ReviewsPage'
import AdminEscrowPage    from '@/pages/admin/EscrowPage'
import AdminDeletionRequestsPage from '@/pages/admin/DeletionRequestsPage'
import AdminReEngagementPage from '@/pages/admin/ReEngagementPage'
import AdminSettingsPage from '@/pages/admin/SettingsPage'

// ─────────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([

  // ── Public ──────────────────────────────────────────────────────────────
  {
    element: <PublicLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      { index: true,                    element: <HomePage /> },
      { path: 'directory',              element: <DirectoryPage /> },
      { path: 'pricing',                element: <PricingPage /> },
      { path: 'c/:handle',              element: <RateCardPage /> },
      { path: 'c/:handle/portfolio',    element: <PortfolioPage /> },
      { path: 'terms',                  element: <TermsPage /> },
      { path: 'privacy',                element: <PrivacyPage /> },
    ],
  },

  // ── Auth ────────────────────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      { path: 'login',                  element: <LoginPage /> },
      { path: 'signup',                 element: <SignUpPage /> },
      { path: 'verify-email',           element: <VerifyEmailPage /> },
      { path: 'reset-password',         element: <ResetPasswordPage /> },
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
          { path: 'onboarding/plan',    element: <PlanSelectionPage /> },
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
          { path: 'creator/dashboard',  element: <CreatorDashboardPage /> },
          { path: 'creator/rate-card',          element: <RateCardBuilderPage /> },
          { path: 'creator/rate-card/:id/edit', element: <RateCardBuilderPage /> },
          { path: 'creator/portfolio',  element: <PortfolioBuilderPage /> },
          { path: 'creator/enquiries',  element: <CreatorEnquiriesPage /> },
          { path: 'creator/money',      element: <MoneyPage /> },
          { path: 'creator/settings',   element: <CreatorSettingsPage /> },
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
          { path: 'brand/dashboard',    element: <BrandDashboardPage /> },
          { path: 'brand/enquiries',    element: <BrandEnquiriesPage /> },
          { path: 'brand/campaigns',    element: <CampaignsPage /> },
          { path: 'brand/campaigns/:id',element: <CampaignDetailPage /> },
          { path: 'brand/shortlist',    element: <ShortlistPage /> },
          { path: 'brand/settings',     element: <BrandSettingsPage /> },
          { path: 'brand/billing',      element: <BrandBillingPage /> },
          { path: 'brand/transactions', element: <BrandTransactionsPage /> },
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
          { path: 'admin',              element: <AdminOverviewPage /> },
          { path: 'admin/disputes',     element: <AdminDisputesPage /> },
          { path: 'admin/accounts',     element: <AdminAccountsPage /> },
          { path: 'admin/reviews',      element: <AdminReviewsPage /> },
          { path: 'admin/escrow',       element: <AdminEscrowPage /> },
          { path: 'admin/deletion-requests', element: <AdminDeletionRequestsPage /> },
          { path: 'admin/re-engagement', element: <AdminReEngagementPage /> },
          { path: 'admin/settings',     element: <AdminSettingsPage /> },
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