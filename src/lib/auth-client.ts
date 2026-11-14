import { createAuthClient } from 'better-auth/react'
import { API_URL, getAuthToken } from '@/lib/api-client'

// Better Auth client (the server lives in vanity-backend, /api/auth/*). The
// dashboard is a cross-origin SPA, so it uses the bearer plugin flow: the
// session token comes back in the `set-auth-token` response header on
// sign-in (see authService.login), is persisted by the auth store, and is
// sent as `Authorization: Bearer …` on every call (here and in apiFetch).
export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    auth: { type: 'Bearer', token: () => getAuthToken() ?? '' },
  },
})
