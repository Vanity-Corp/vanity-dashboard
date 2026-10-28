import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'
import type { BrandingConfig } from '@/types'

// Public dashboard branding (title + logo), editable from Paramètres → Général.
// Works without auth (login / reset pages) since the backend route is public.
export function useBranding() {
  return useQuery({
    queryKey: ['branding'],
    queryFn: () => apiFetch<BrandingConfig>('/branding'),
    staleTime: 5 * 60_000,
  })
}
