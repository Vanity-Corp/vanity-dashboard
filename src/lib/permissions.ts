// Granular RBAC permission catalogue for Vanity. Permissions are stored on
// the user independently of their role (the backend is the source of
// truth) — these constants let the UI gate sidebar items, buttons and
// routes. `"*"` is the super-permission held by admins. Must match
// vanity-backend's permission strings exactly (see e.g.
// src/roles/roles.dto.ts's NAV_SECTIONS and each resource controller's
// @RequirePermissions calls).

export const PERMISSIONS = {
  pagesRead: 'pages.read',
  pagesWrite: 'pages.write',
  servicesRead: 'services.read',
  servicesWrite: 'services.write',
  clientsRead: 'clients.read',
  clientsWrite: 'clients.write',
  teamRead: 'team.read',
  teamWrite: 'team.write',
  submissionsRead: 'submissions.read',
  submissionsWrite: 'submissions.write',
  mediaRead: 'media.read',
  mediaWrite: 'media.write',
  articlesRead: 'articles.read',
  articlesWrite: 'articles.write',
  portfolioRead: 'portfolio.read',
  portfolioWrite: 'portfolio.write',
  testimonialsRead: 'testimonials.read',
  testimonialsWrite: 'testimonials.write',
  pricingRead: 'pricing.read',
  pricingWrite: 'pricing.write',
  membersRead: 'members.read',
  membersManage: 'members.manage',
  settingsManage: 'settings.manage',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// The full ordered list, used by the Settings → Rôles permission checkboxes
// and the Membres create/edit staff dialog.
export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS)

// Roles are custom/admin-created (Settings → Rôles) — there's no fixed
// name→permissions map. A role's own `permissions` (fetched from
// GET /admin/roles) is the only source of defaults for a new staff member.

// Core check: does this permission set satisfy the required permission?
export function hasPermission(
  permissions: string[] | undefined,
  required: Permission | Permission[],
): boolean {
  const perms = permissions ?? []
  if (perms.includes('*')) return true
  const list = Array.isArray(required) ? required : [required]
  return list.every((p) => perms.includes(p))
}

// A ".read" permission never needs section-level canEdit — everything else
// (write/manage) does. Used by usePermissions() to make <Can> route-aware
// without a many-to-one permission→section map.
export function isReadPermission(permission: string): boolean {
  return permission.endsWith('.read')
}
