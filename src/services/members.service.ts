import { apiFetch } from '@/lib/api-client'
import type { StaffMember, CreateStaffPayload, UpdateStaffPayload } from '@/types'

export const membersService = {
  list: (params?: { roleId?: string; status?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.roleId) qs.set('roleId', params.roleId)
    if (params?.status) qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return apiFetch<StaffMember[]>(`/admin/members${suffix}`)
  },
  create: (payload: CreateStaffPayload) =>
    apiFetch<{ user: StaffMember; temporaryPassword: string }>('/admin/members', {
      method: 'POST',
      body: payload,
    }),
  update: (id: string, payload: UpdateStaffPayload) =>
    apiFetch<StaffMember>(`/admin/members/${id}`, { method: 'PATCH', body: payload }),
  remove: (id: string) => apiFetch<void>(`/admin/members/${id}`, { method: 'DELETE' }),
  resetPassword: (id: string) =>
    apiFetch<{ temporaryPassword: string }>(`/admin/members/${id}/reset-password`, { method: 'POST' }),
}
