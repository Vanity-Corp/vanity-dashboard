import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  type ColumnDef, type RowSelectionState,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, Pencil, Trash2, KeyRound, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTablePagination } from '@/components/shared/DataTablePagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/components/shared/Can'
import { membersService } from '@/services/members.service'
import { rolesService } from '@/services/roles.service'
import { PERMISSIONS } from '@/lib/permissions'
import { useDebounce } from '@/hooks/use-debounce'
import { ApiError } from '@/lib/api-client'
import type { StaffMember } from '@/types'

interface MemberForm {
  firstName: string
  lastName: string
  email: string
  roleId: string
  status: 'ACTIVE' | 'SUSPENDED'
}

const emptyForm: MemberForm = { firstName: '', lastName: '', email: '', roleId: '', status: 'ACTIVE' }

const EMPTY_TABLE_COLUMNS: ColumnDef<StaffMember>[] = [{ id: 'row' }]

export function MembersPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [form, setForm] = useState<MemberForm>(emptyForm)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const debouncedFilter = useDebounce(globalFilter, 300)

  const { data: members, isLoading } = useQuery({ queryKey: ['members'], queryFn: () => membersService.list() })
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: rolesService.list })

  const rows = members ?? []
  const roleName = (roleId: string | null) => roles?.find((r) => r.id === roleId)?.name ?? '—'

  const filteredRows = useMemo(() => {
    const q = debouncedFilter.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((m) => {
      const haystack = `${m.firstName ?? ''} ${m.lastName ?? ''} ${m.email}`.toLowerCase()
      return haystack.includes(q)
    })
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

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, roleId: roles?.[0]?.id ?? '' })
    setDialogOpen(true)
  }

  const openEdit = (m: StaffMember) => {
    setEditing(m)
    setForm({
      firstName: m.firstName ?? '', lastName: m.lastName ?? '', email: m.email,
      roleId: m.roleId ?? '', status: m.status,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return membersService.update(editing.id, {
          firstName: form.firstName, lastName: form.lastName, email: form.email,
          roleId: form.roleId, status: form.status,
        })
      }
      const res = await membersService.create({
        firstName: form.firstName, lastName: form.lastName, email: form.email, roleId: form.roleId,
      })
      setTempPassword(res.temporaryPassword)
      return res.user
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success(editing ? 'Membre mis à jour' : 'Membre créé')
      if (editing) setDialogOpen(false)
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const deleteMutation = useMutation({
    mutationFn: membersService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Membre supprimé')
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => membersService.remove(id))),
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      setRowSelection({})
      toast.success(`${ids.length} membre(s) supprimé(s)`)
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: membersService.resetPassword,
    onSuccess: (res) => {
      toast.success(`Nouveau mot de passe temporaire : ${res.temporaryPassword}`)
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Membres</CardTitle>
            <CardDescription>Comptes du tableau de bord et leur rôle.</CardDescription>
          </div>
          <Can permission={PERMISSIONS.membersManage}>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau membre
            </Button>
          </Can>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-48 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre…"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">{selectedIds.length} sélectionné(s)</span>
                <Can permission={PERMISSIONS.membersManage}>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => setBulkDeleteOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </Can>
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Can permission={PERMISSIONS.membersManage} fallback={null}>
                      <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                      />
                    </Can>
                  </TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }, (_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }, (_, j) => (
                        <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Aucun membre.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((row) => {
                    const m = row.original
                    return (
                      <TableRow key={m.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                        <TableCell>
                          <Can permission={PERMISSIONS.membersManage} fallback={null}>
                            <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />
                          </Can>
                        </TableCell>
                        <TableCell className="font-medium">{m.firstName} {m.lastName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                        <TableCell><Badge variant="outline">{roleName(m.roleId)}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={m.status === 'ACTIVE' ? 'default' : 'destructive'}>
                            {m.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Can permission={PERMISSIONS.membersManage}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(m)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => resetPasswordMutation.mutate(m.id)}>
                                  <KeyRound className="h-4 w-4 mr-2" />
                                  Réinitialiser le mot de passe
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteId(m.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </Can>
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
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setTempPassword(null)
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le membre' : 'Nouveau membre'}</DialogTitle>
          </DialogHeader>

          {tempPassword ? (
            <div className="space-y-4">
              <p className="text-sm">Compte créé. Mot de passe temporaire à communiquer une seule fois :</p>
              <code className="block rounded-md bg-muted p-3 text-sm font-mono">{tempPassword}</code>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir un rôle" /></SelectTrigger>
                    <SelectContent>
                      {(roles ?? []).map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {editing && (
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as MemberForm['status'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Actif</SelectItem>
                        <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {tempPassword ? (
              <Button onClick={() => setDialogOpen(false)}>Fermer</Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={!form.email.trim() || !form.roleId || saveMutation.isPending}
                >
                  {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Supprimer ce membre ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId)
            setDeleteId(null)
          }
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Supprimer ${selectedIds.length} membre(s) ?`}
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => {
          bulkDeleteMutation.mutate(selectedIds)
          setBulkDeleteOpen(false)
        }}
      />
    </div>
  )
}
