import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/lib/api-client'

// Real-time push for new submissions (GET /api/admin/submissions/stream,
// NestJS @Sse). Authenticated via the Better Auth session COOKIE, not the
// bearer token the rest of the app uses — the native EventSource API can't
// send a custom Authorization header, only `withCredentials` for cookies.
// Better Auth sets that cookie on sign-in regardless of the bearer plugin,
// and the backend's CORS already allows credentials, so this just works.
//
// On every event we invalidate the submissions query rather than merging
// the pushed row by hand — simpler and avoids drifting from whatever the
// list endpoint actually returns.
export function useSubmissionsStream(enabled: boolean) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const source = new EventSource(`${API_URL}/api/admin/submissions/stream`, {
      withCredentials: true,
    })

    source.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
    }
    source.onerror = (err) => {
      // EventSource reconnects on its own after this; just surface it for debugging.
      console.warn('Submissions SSE stream error (will auto-reconnect):', err)
    }

    return () => source.close()
  }, [enabled, queryClient])
}
