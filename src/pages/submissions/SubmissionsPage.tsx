import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  type ColumnDef, type RowSelectionState,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { Search, MailOpen, Mail, Eye, MoreHorizontal, MailCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTablePagination } from '@/components/shared/DataTablePagination'
import { submissionsService } from '@/services/submissions.service'
import { useDebounce } from '@/hooks/use-debounce'
import { formatDateTime } from '@/lib/utils'
import { ApiError } from '@/lib/api-client'
import type { Submission, SubmissionLifecycle, SubmissionType } from '@/types'

const TYPE_LABELS: Record<SubmissionType, string> = {
  CONTACT: 'Contact', QUOTE: 'Devis', RESERVATION: 'Réservation',
}
const STATUS_VARIANT: Record<Submission['status'], 'default' | 'outline' | 'destructive'> = {
  PENDING: 'outline', SENT: 'default', FAILED: 'destructive',
}
const STATUS_LABELS: Record<Submission['status'], string> = {
  PENDING: 'En attente', SENT: 'Envoyée', FAILED: 'Échec envoi',
}
const LIFECYCLE_LABELS: Record<SubmissionLifecycle, string> = {
  NEW: 'Nouveau', IN_PROGRESS: 'En cours', CLOSED: 'Clôturé',
}
const CLIENT_TYPE_LABELS: Record<string, string> = {
  particulier: 'Particulier', societe: 'Société / Professionnel',
}

const EMPTY_TABLE_COLUMNS: ColumnDef<Submission>[] = [{ id: 'row' }]

function LifecycleSelect({ submission, onChange }: { submission: Submission; onChange: (v: SubmissionLifecycle) => void }) {
  return (
    <Select value={submission.lifecycle} onValueChange={(v) => onChange(v as SubmissionLifecycle)}>
      <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
      <SelectContent>
        {(Object.keys(LIFECYCLE_LABELS) as SubmissionLifecycle[]).map((l) => (
          <SelectItem key={l} value={l}>{LIFECYCLE_LABELS[l]}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Ported business logic surfaced here: `status` (PENDING/SENT/FAILED) is the
// system-set two-phase-durability result and is read-only in this UI —
// only `lifecycle` and `read` are staff-editable, exactly as in
// dasboard-vanity's original Submissions collection.
export function SubmissionsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<SubmissionType | 'ALL'>('ALL')
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [viewing, setViewing] = useState<Submission | null>(null)
  const debouncedFilter = useDebounce(globalFilter, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', filter],
    queryFn: () => submissionsService.list(filter === 'ALL' ? undefined : filter),
  })

  const rows = data ?? []

  const filteredRows = useMemo(() => {
    const q = debouncedFilter.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((s) => `${s.name} ${s.email} ${s.message ?? ''}`.toLowerCase().includes(q))
  }, [rows, debouncedFilter])

  const table = useReactTable({
    data: filteredRows,
    columns: EMPTY_TABLE_COLUMNS,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const pageRows = table.getRowModel().rows
  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof submissionsService.update>[1] }) =>
      submissionsService.update(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      queryClient.invalidateQueries({ queryKey: ['submissions', 'unread-counts'] })
      setViewing((v) => (v && v.id === updated.id ? updated : v))
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const bulkMarkMutation = useMutation({
    mutationFn: ({ ids, read }: { ids: string[]; read: boolean }) =>
      Promise.all(ids.map((id) => submissionsService.update(id, { read }))),
    onSuccess: (_data, { read }) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      queryClient.invalidateQueries({ queryKey: ['submissions', 'unread-counts'] })
      setRowSelection({})
      toast.success(read ? 'Marquées comme lues' : 'Marquées comme non lues')
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const openSubmission = (s: Submission) => {
    setViewing(s)
    if (!s.read) updateMutation.mutate({ id: s.id, payload: { read: true } })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes</CardTitle>
        <CardDescription>Contact, devis et réservations reçus depuis le site.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as SubmissionType | 'ALL')}>
          <TabsList>
            <TabsTrigger value="ALL">Toutes</TabsTrigger>
            <TabsTrigger value="CONTACT">Contact</TabsTrigger>
            <TabsTrigger value="QUOTE">Devis</TabsTrigger>
            <TabsTrigger value="RESERVATION">Réservation</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une demande…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">{selectedIds.length} sélectionné(s)</span>
              <Button variant="outline" size="sm" onClick={() => bulkMarkMutation.mutate({ ids: selectedIds, read: true })}>
                <MailOpen className="h-4 w-4 mr-1" />
                Marquer lu
              </Button>
              <Button variant="outline" size="sm" onClick={() => bulkMarkMutation.mutate({ ids: selectedIds, read: false })}>
                <Mail className="h-4 w-4 mr-1" />
                Marquer non lu
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                  />
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Envoi</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Reçu le</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }, (_, j) => (
                      <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Aucune demande.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row) => {
                  const s = row.original
                  return (
                    <TableRow key={s.id} className={s.read ? '' : 'bg-muted/40'} data-state={row.getIsSelected() ? 'selected' : undefined}>
                      <TableCell>
                        <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />
                      </TableCell>
                      <TableCell><Badge variant="outline">{TYPE_LABELS[s.type]}</Badge></TableCell>
                      <TableCell>
                        <button type="button" className="text-left hover:underline" onClick={() => openSubmission(s)}>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.email}</div>
                        </button>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {s.message ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[s.status]}>{STATUS_LABELS[s.status]}</Badge>
                      </TableCell>
                      <TableCell>
                        <LifecycleSelect
                          submission={s}
                          onChange={(lifecycle) => updateMutation.mutate({ id: s.id, payload: { lifecycle } })}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {formatDateTime(s.createdAt)}
                          <Switch
                            checked={s.read}
                            onCheckedChange={(v) => updateMutation.mutate({ id: s.id, payload: { read: v } })}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openSubmission(s)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir le détail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateMutation.mutate({ id: s.id, payload: { read: !s.read } })}
                            >
                              {s.read ? (
                                <>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Marquer non lu
                                </>
                              ) : (
                                <>
                                  <MailCheck className="h-4 w-4 mr-2" />
                                  Marquer lu
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </CardContent>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewing && <Badge variant="outline">{TYPE_LABELS[viewing.type]}</Badge>}
              {viewing?.name}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p>{viewing.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Téléphone</p>
                  <p>{viewing.phone ?? '—'}</p>
                </div>
                {viewing.clientType && (
                  <div>
                    <p className="text-xs text-muted-foreground">Type de client</p>
                    <p>{CLIENT_TYPE_LABELS[viewing.clientType] ?? viewing.clientType}</p>
                  </div>
                )}
                {viewing.projectType && (
                  <div>
                    <p className="text-xs text-muted-foreground">Type de projet</p>
                    <p>{viewing.projectType}</p>
                  </div>
                )}
                {viewing.budget && (
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p>{viewing.budget}</p>
                  </div>
                )}
                {viewing.date && (
                  <div>
                    <p className="text-xs text-muted-foreground">Date souhaitée</p>
                    <p>{formatDateTime(viewing.date)}</p>
                  </div>
                )}
                {viewing.hours.length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Créneaux</p>
                    <p>{viewing.hours.join(', ')}</p>
                  </div>
                )}
              </div>

              {viewing.message && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Message</p>
                  <p className="text-sm whitespace-pre-wrap rounded-md border bg-muted/30 p-3">{viewing.message}</p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t">
                <div className="space-y-1">
                  <Label className="text-xs">Statut d'envoi</Label>
                  <div><Badge variant={STATUS_VARIANT[viewing.status]}>{STATUS_LABELS[viewing.status]}</Badge></div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Suivi</Label>
                  <LifecycleSelect
                    submission={viewing}
                    onChange={(lifecycle) => updateMutation.mutate({ id: viewing.id, payload: { lifecycle } })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={viewing.read}
                  onCheckedChange={(v) => updateMutation.mutate({ id: viewing.id, payload: { read: v } })}
                />
                <Label>Marquée comme lue</Label>
              </div>
              <p className="text-xs text-muted-foreground">Reçue le {formatDateTime(viewing.createdAt)}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
