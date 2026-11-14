// Permission-string catalogue for Vanity's UI. Each value is
// "section.action" and maps directly onto a RoleSection row (section +
// canView/canEdit) — there is no separate granular-permissions list on the
// backend anymore (see the Better Auth migration notes). Kept as named
// constants purely so call sites read `PERMISSIONS.pagesWrite` instead of
// the raw string.

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

// "section.read" needs only canView; every other action ("write", "manage"...)
// needs canEdit. Splits a permission string into its section + whether it
// needs edit access.
export function parsePermission(permission: string): { section: string; needsEdit: boolean } {
  const [section, action] = permission.split('.')
  return { section, needsEdit: action !== 'read' }
}
