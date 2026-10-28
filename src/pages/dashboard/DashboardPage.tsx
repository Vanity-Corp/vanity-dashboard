import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth.store'
import { submissionsService } from '@/services/submissions.service'
import { usePermissions } from '@/hooks/use-permissions'
import { PERMISSIONS } from '@/lib/permissions'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { can } = usePermissions()
  const canSeeSubmissions = can(PERMISSIONS.submissionsRead)

  const { data: unread } = useQuery({
    queryKey: ['submissions', 'unread-counts'],
    queryFn: submissionsService.unreadCounts,
    enabled: canSeeSubmissions,
  })

  const totalUnread = Object.values(unread ?? {}).reduce((sum, n) => sum + n, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bonjour {user?.firstName || 'là'} 👋
        </h1>
        <p className="text-muted-foreground">Vue d'ensemble du tableau de bord Vanity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {canSeeSubmissions && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Demandes non lues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalUnread}</div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rôle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{user?.role?.name ?? '—'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
