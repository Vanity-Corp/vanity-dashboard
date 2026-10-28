import { apiFetch, setAuthToken } from '@/lib/api-client'
import type { AuthResponse, AuthUser, AuthUserRole, LoginCredentials } from '@/types'

// Wired to vanity-backend: login (POST /auth/login, email-only — unlike
// Scolaris, Vanity staff have no separate username), forgot/reset password,
// and the current-user + profile endpoints (GET/PATCH /auth/me).

interface BackendRole {
  id: string
  name: string
  sections: { section: string; canView: boolean; canEdit: boolean }[]
}

interface BackendUser {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  status: 'ACTIVE' | 'SUSPENDED'
  permissions?: string[]
  avatar?: string | null
  createdAt?: string
  roleId: string | null
  roleRef: BackendRole | null
}

function mapRole(r: BackendRole | null): AuthUserRole | null {
  return r && { id: r.id, name: r.name, sections: r.sections }
}

function mapUser(u: BackendUser): AuthUser {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName ?? '',
    lastName: u.lastName ?? '',
    role: mapRole(u.roleRef),
    permissions: u.permissions ?? [],
    avatar: u.avatar ?? undefined,
    status: u.status,
    createdAt: u.createdAt ?? new Date().toISOString(),
  }
}

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  password?: string
  avatar?: string
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiFetch<{ token: string; user: BackendUser }>('/auth/login', {
      method: 'POST',
      body: { email: credentials.email, password: credentials.password },
    })
    if (!res.user.roleRef) {
      throw new Error('Accès réservé aux comptes du tableau de bord.')
    }
    setAuthToken(res.token)
    return { user: mapUser(res.user), token: res.token }
  },

  logout: async (): Promise<void> => {
    // Stateless JWT — nothing to invalidate server-side; just drop the token.
    setAuthToken(null)
  },

  forgotPassword: (email: string) =>
    apiFetch<{ ok: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch<{ ok: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    }),

  me: async (token: string): Promise<AuthUser> => {
    setAuthToken(token)
    const user = await apiFetch<BackendUser>('/auth/me')
    return mapUser(user)
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<AuthUser> => {
    const user = await apiFetch<BackendUser>('/auth/me', {
      method: 'PATCH',
      body: payload,
    })
    return mapUser(user)
  },
}
