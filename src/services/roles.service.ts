import { apiFetch } from '@/lib/api-client'
import type { Role, RolePayload } from '@/types'

export const rolesService = {
  list: () => apiFetch<Role[]>('/admin/roles'),
  get: (id: string) => apiFetch<Role>(`/admin/roles/${id}`),
  create: (payload: RolePayload) =>
    apiFetch<Role>('/admin/roles', { method: 'POST', body: payload }),
  update: (id: string, payload: Partial<RolePayload>) =>
    apiFetch<Role>(`/admin/roles/${id}`, { method: 'PATCH', body: payload }),
  remove: (id: string) => apiFetch<void>(`/admin/roles/${id}`, { method: 'DELETE' }),
}
