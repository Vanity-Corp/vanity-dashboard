import type { ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import type { Permission } from '@/lib/permissions'

// Renders `children` only when the current user holds the required
// permission(s) (all of them, if an array). Optionally renders `fallback`
// otherwise. Use it to gate action buttons and sections:
//   <Can permission="pages.write"><Button>Nouvelle page</Button></Can>
export function Can({
  permission,
  fallback = null,
  children,
}: {
  permission: Permission | Permission[]
  fallback?: ReactNode
  children: ReactNode
}) {
  const { can } = usePermissions()
  return <>{can(permission) ? children : fallback}</>
}
