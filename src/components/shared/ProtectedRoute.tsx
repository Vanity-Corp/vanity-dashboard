import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { sectionForPath } from '@/lib/nav-sections'

interface ProtectedRouteProps {
  children: React.ReactNode
}

// Requires auth, then defense-in-depth beyond the sidebar hiding a link: a
// user who types a URL for a section their role can't view is bounced back
// to the dashboard home, mirroring the sidebar's canViewSection check and
// the backend's PermissionsGuard @Section enforcement.
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  const section = sectionForPath(location.pathname)
  if (section && !user.permissions.includes('*')) {
    const access = user.role?.sections.find((s) => s.section === section)
    const canView = !!(access?.canView || access?.canEdit)
    if (!canView && location.pathname !== '/dashboard') {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
