// The shared source of truth for dashboard nav sections — the exact same 13
// keys as vanity-backend's NAV_SECTIONS (roles.dto.ts), used to build the
// Settings → Rôles access matrix, filter the sidebar by canView, and (via
// sectionForPath) make <Can>/usePermissions route-aware for the canEdit check.

export interface NavSection {
  key: string
  label: string
}

export const NAV_SECTIONS: NavSection[] = [
  { key: 'dashboard', label: 'Tableau de bord' },
  { key: 'pages', label: 'Pages' },
  { key: 'services', label: 'Services' },
  { key: 'clients', label: 'Clients' },
  { key: 'team', label: 'Équipe' },
  { key: 'submissions', label: 'Demandes' },
  { key: 'media', label: 'Média' },
  { key: 'articles', label: 'Articles' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'testimonials', label: 'Témoignages' },
  { key: 'pricing', label: 'Tarifs' },
  { key: 'members', label: 'Membres' },
  { key: 'settings', label: 'Paramètres' },
]

// Ordered so the most specific route wins; '/dashboard' itself is checked
// separately as an exact match since it's a prefix of every other route.
const ROUTE_SECTIONS: { prefix: string; section: string }[] = [
  { prefix: '/dashboard/pages', section: 'pages' },
  { prefix: '/dashboard/services', section: 'services' },
  { prefix: '/dashboard/clients', section: 'clients' },
  { prefix: '/dashboard/team', section: 'team' },
  { prefix: '/dashboard/submissions', section: 'submissions' },
  { prefix: '/dashboard/media', section: 'media' },
  { prefix: '/dashboard/articles', section: 'articles' },
  { prefix: '/dashboard/portfolio', section: 'portfolio' },
  { prefix: '/dashboard/testimonials', section: 'testimonials' },
  { prefix: '/dashboard/pricing', section: 'pricing' },
  { prefix: '/dashboard/members', section: 'members' },
  { prefix: '/dashboard/settings', section: 'settings' },
]

// Resolves the current pathname to its nav section, or null for a route not
// covered by the matrix (e.g. auth pages) — callers treat null as "no extra
// restriction beyond the granular permission check".
export function sectionForPath(pathname: string): string | null {
  if (pathname === '/dashboard') return 'dashboard'
  for (const { prefix, section } of ROUTE_SECTIONS) {
    if (pathname.startsWith(prefix)) return section
  }
  return null
}
