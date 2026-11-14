// Thin fetch wrapper for vanity-backend (NestJS). Attaches the Better Auth
// bearer token (set by the auth store on login / rehydrate) and normalises
// errors. Routes live under /api.

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// The token lives here (set by auth.store) rather than being imported from the
// store, to avoid a circular dependency (store → auth.service → api-client).
// Also read by lib/auth-client.ts's bearer plugin config.
let authToken: string | null = null
export function setAuthToken(token: string | null) {
  authToken = token
}
export function getAuthToken(): string | null {
  return authToken
}

// A 401 on an AUTHENTICATED request means the token is invalid/expired (e.g.
// a stale token left in localStorage). Clear the persisted session and bounce
// to /login so the app can't get stuck sending a dead token on every call.
function clearSessionAndRedirect() {
  authToken = null
  try {
    localStorage.removeItem('auth-storage')
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError('Impossible de joindre le serveur.', 0, 'NETWORK')
  }

  const json: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && authToken) {
      clearSessionAndRedirect()
    }
    const err = (json ?? {}) as { message?: string | string[]; code?: string }
    const message = Array.isArray(err.message)
      ? err.message.join(' ')
      : (err.message ?? 'Une erreur est survenue.')
    throw new ApiError(message, res.status, err.code)
  }
  return json as T
}

// Multipart upload (media files). Must NOT set a Content-Type header — the
// browser sets the multipart boundary itself.
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method: 'POST',
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: formData,
    })
  } catch {
    throw new ApiError('Impossible de joindre le serveur.', 0, 'NETWORK')
  }

  const json: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && authToken) {
      clearSessionAndRedirect()
    }
    const err = (json ?? {}) as { message?: string | string[]; code?: string }
    const message = Array.isArray(err.message)
      ? err.message.join(' ')
      : (err.message ?? 'Une erreur est survenue.')
    throw new ApiError(message, res.status, err.code)
  }
  return json as T
}
