import { useAuthStore } from '@/store/auth.store'
import { parsePermission, type Permission } from '@/lib/permissions'

// Resolves a `can(...)` checker purely from the current user's Role section
// matrix (canView/canEdit) — there is no separate granular-permissions list
// on the backend anymore. A permission string like "pages.write" is parsed
// into its section ("pages") and whether it needs canEdit (anything but
// ".read" does).
export function usePermissions() {
  const roleSections = useAuthStore((s) => s.user?.role?.sections)

  const can = (required: Permission | Permission[]) => {
    const list = Array.isArray(required) ? required : [required]
    return list.every((permission) => {
      const { section, needsEdit } = parsePermission(permission)
      const access = roleSections?.find((s) => s.section === section)
      return needsEdit ? !!access?.canEdit : !!(access?.canView || access?.canEdit)
    })
  }

  return { can }
}
