import { createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { PagesPage } from '@/pages/pages/PagesPage'
import { ServicesPage } from '@/pages/services/ServicesPage'
import { ClientsPage } from '@/pages/clients/ClientsPage'
import { TeamPage } from '@/pages/team/TeamPage'
import { SubmissionsPage } from '@/pages/submissions/SubmissionsPage'
import { MediaPage } from '@/pages/media/MediaPage'
import { ArticlesPage } from '@/pages/articles/ArticlesPage'
import { PortfolioPage } from '@/pages/portfolio/PortfolioPage'
import { TestimonialsPage } from '@/pages/testimonials/TestimonialsPage'
import { PricingPage } from '@/pages/pricing/PricingPage'
import { MembersPage } from '@/pages/members/MembersPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'pages', element: <PagesPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'team', element: <TeamPage /> },
      { path: 'submissions', element: <SubmissionsPage /> },
      { path: 'media', element: <MediaPage /> },
      { path: 'articles', element: <ArticlesPage /> },
      { path: 'portfolio', element: <PortfolioPage /> },
      { path: 'testimonials', element: <TestimonialsPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'members', element: <MembersPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
