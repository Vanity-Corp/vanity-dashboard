import { apiFetch } from '@/lib/api-client'

// Generic CRUD service factory for Vanity's simple content collections
// (Services, Clients, Team Members, Articles, Portfolio, Testimonials,
// Pricing) — each vanity-backend module follows the exact same admin CRUD
// shape (list/get/create/update/remove under /admin/{basePath}), so one
// factory avoids ten near-identical service files.
export function createResourceService<T, TCreate = Partial<T>, TUpdate = Partial<T>>(
  basePath: string,
) {
  return {
    list: () => apiFetch<T[]>(`/admin/${basePath}`),
    get: (id: string) => apiFetch<T>(`/admin/${basePath}/${id}`),
    create: (payload: TCreate) =>
      apiFetch<T>(`/admin/${basePath}`, { method: 'POST', body: payload }),
    update: (id: string, payload: TUpdate) =>
      apiFetch<T>(`/admin/${basePath}/${id}`, { method: 'PATCH', body: payload }),
    remove: (id: string) => apiFetch<void>(`/admin/${basePath}/${id}`, { method: 'DELETE' }),
  }
}
