import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function AuthLayout() {
  // Must use the SAME "logged in" condition as ProtectedRoute
  // (isAuthenticated && user), or the two guards redirect back and forth.
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated && user) return <Navigate to="/dashboard" replace />
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  )
}
