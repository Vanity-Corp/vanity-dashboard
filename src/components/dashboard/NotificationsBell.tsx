import { Bell, Mail, FileText, CalendarClock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { submissionsService } from '@/services/submissions.service'
import { usePermissions } from '@/hooks/use-permissions'
import { useSubmissionsStream } from '@/hooks/use-submissions-stream'
import { PERMISSIONS } from '@/lib/permissions'
import { formatRelativeTime } from '@/lib/utils'
import type { Submission, SubmissionType } from '@/types'

const TYPE_ICON: Record<SubmissionType, typeof Mail> = {
  CONTACT: Mail, QUOTE: FileText, RESERVATION: CalendarClock,
}
const TYPE_LABEL: Record<SubmissionType, string> = {
  CONTACT: 'Contact', QUOTE: 'Devis', RESERVATION: 'Réservation',
}

// Real per-item notification list backed by actual unread Submissions (not a
// synthetic aggregate) — each row is one demand, click-to-navigate + marks
// that single submission read. Ported from dasboard-vanity's original
// admin-notifications polling pattern, now via react-query.
export function NotificationsBell() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { can } = usePermissions()
  const enabled = can(PERMISSIONS.submissionsRead)

  const { data } = useQuery({
    queryKey: ['submissions', 'ALL'],
    queryFn: () => submissionsService.list(),
    enabled,
    // Safety net only — real-time push below is the primary mechanism, this
    // just covers the (rare) case the SSE connection is down.
    refetchInterval: 120_000,
  })

  useSubmissionsStream(enabled)

  const markReadMutation = useMutation({
    mutationFn: (id: string) => submissionsService.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
    },
  })

  if (!enabled) return null

  const unread = (data ?? [])
    .filter((s) => !s.read)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const recent = unread.slice(0, 8)

  const openSubmission = (s: Submission) => {
    markReadMutation.mutate(s.id)
    navigate('/dashboard/submissions')
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
          </Button>
          {unread.length > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full px-1 text-[10px]">
              {unread.length}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">Demandes non lues</p>
          {unread.length > 0 && <Badge variant="secondary">{unread.length}</Badge>}
        </div>
        {recent.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Aucune nouvelle demande.</p>
        ) : (
          <div className="divide-y max-h-80 overflow-y-auto">
            {recent.map((s) => {
              const Icon = TYPE_ICON[s.type]
              return (
                <button
                  key={s.id}
                  onClick={() => openSubmission(s)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-accent"
                >
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">{TYPE_LABEL[s.type]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(s.createdAt)}</span>
                </button>
              )
            })}
          </div>
        )}
        <button
          onClick={() => navigate('/dashboard/submissions')}
          className="block w-full border-t px-4 py-2 text-center text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          Voir toutes les demandes
        </button>
      </PopoverContent>
    </Popover>
  )
}
