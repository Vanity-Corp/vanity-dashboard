import { useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { hasPermission, isReadPermission, type Permission } from '@/lib/permissions'
import { sectionForPath } from '@/lib/nav-sections'

// Reads the current user's granular permissions and returns a `can(...)`
// checker. Admins (permissions include "*") pass every check. Route-aware:
// for a route belonging to a nav section, any non-read permission ALSO
// requires that section's canEdit on the user's role — the additive layer
// Settings → Rôles configures on top of the granular permissions below.
export function usePermissions() {
  const permissions = useAuthStore((s) => s.user?.permissions)
  const roleSections = useAuthStore((s) => s.user?.role?.sections)
  const location = useLocation()

  const can = (required: Permission | Permission[]) => {
    if (!hasPermission(permissions, required)) return false
    if (permissions?.includes('*')) return true

    const list = Array.isArray(required) ? required : [required]
    const needsEdit = list.some((p) => !isReadPermission(p))
    if (!needsEdit) return true

    const section = sectionForPath(location.pathname)
    if (!section) return true
    const access = roleSections?.find((s) => s.section === section)
    return !!access?.canEdit
  }

  return { permissions: permissions ?? [], can }
}
