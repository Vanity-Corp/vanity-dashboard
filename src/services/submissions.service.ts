import { apiFetch } from '@/lib/api-client'
import type { Submission, SubmissionType, SubmissionLifecycle } from '@/types'

export const submissionsService = {
  list: (type?: SubmissionType) =>
    apiFetch<Submission[]>(`/admin/submissions${type ? `?type=${type}` : ''}`),
  get: (id: string) => apiFetch<Submission>(`/admin/submissions/${id}`),
  update: (id: string, payload: { lifecycle?: SubmissionLifecycle; read?: boolean }) =>
    apiFetch<Submission>(`/admin/submissions/${id}`, { method: 'PATCH', body: payload }),
  unreadCounts: () => apiFetch<Record<string, number>>('/admin/submissions/unread-counts'),
  markTypeRead: (type: SubmissionType) =>
    apiFetch<void>(`/admin/submissions/mark-read/${type}`, { method: 'POST' }),
}
