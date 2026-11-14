import { ApiError, apiFetch, setAuthToken } from '@/lib/api-client'
import { authClient } from '@/lib/auth-client'
import type { AuthResponse, AuthUser, AuthUserRole, LoginCredentials } from '@/types'

// Better Auth (served by vanity-backend at /api/auth/*) handles sign-in,
// sign-out and password reset; /api/account/me returns the staff role
// matrix and updates the profile.

function authError(error: { code?: string; message?: string; status?: number }): ApiError {
  const invalid = error.code === 'INVALID_EMAIL_OR_PASSWORD'
  return new ApiError(
    invalid ? 'Identifiants invalides.' : (error.message ?? 'Une erreur est survenue.'),
    error.status ?? 0,
    error.code,
  )
}

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
    let token: string | null = null
    const onSuccess = (ctx: { response: Response }) => {
      token = ctx.response.headers.get('set-auth-token')
    }
    const { error } = await authClient.signIn.email(
      { email: credentials.email, password: credentials.password },
      { onSuccess },
    )
    if (error) throw authError(error)
    if (!token) throw new Error('Réponse inattendue du serveur.')

    setAuthToken(token)
    const user = await apiFetch<BackendUser>('/account/me')
    if (!user.roleRef) {
      await authClient.signOut().catch(() => undefined)
      setAuthToken(null)
      throw new Error('Accès réservé aux comptes du tableau de bord.')
    }
    return { user: mapUser(user), token }
  },

  logout: async (): Promise<void> => {
    await authClient.signOut().catch(() => undefined)
    setAuthToken(null)
  },

  forgotPassword: async (email: string) => {
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw authError(error)
    return { ok: true }
  },

  resetPassword: async (token: string, password: string) => {
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    if (error) throw authError(error)
    return { ok: true }
  },

  me: async (token: string): Promise<AuthUser> => {
    setAuthToken(token)
    const user = await apiFetch<BackendUser>('/account/me')
    return mapUser(user)
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<AuthUser> => {
    const user = await apiFetch<BackendUser>('/account/me', {
      method: 'PATCH',
      body: payload,
    })
    return mapUser(user)
  },
}
