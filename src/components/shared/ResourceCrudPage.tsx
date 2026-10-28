import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  type ColumnDef, type RowSelectionState,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTablePagination } from '@/components/shared/DataTablePagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/components/shared/Can'
import { usePermissions } from '@/hooks/use-permissions'
import { useDebounce } from '@/hooks/use-debounce'
import { ApiError } from '@/lib/api-client'
import type { Permission } from '@/lib/permissions'

interface Column<T> {
  header: string
  render: (item: T) => ReactNode
  className?: string
}

interface ResourceCrudPageProps<T extends { id: string }, TForm> {
  title: string
  description?: string
  queryKey: string
  service: {
    list: () => Promise<T[]>
    create: (payload: TForm) => Promise<T>
    update: (id: string, payload: TForm) => Promise<T>
    remove: (id: string) => Promise<void>
  }
  columns: Column<T>[]
  readPermission: Permission
  writePermission: Permission
  emptyForm: TForm
  toFormState: (item: T) => TForm
  renderForm: (state: TForm, setState: (next: TForm) => void) => ReactNode
  getRowName: (item: T) => string
  createLabel?: string
  isFormValid?: (state: TForm) => boolean
  searchPlaceholder?: string
  // Extra fields to match against, beyond getRowName (e.g. an email or slug) —
  // joined together, lowercased, for the debounced client-side search filter.
  searchFields?: (item: T) => string[]
  // Override the create/edit dialog's width — resources with a heavier editor
  // (e.g. Articles' rich-text content) want more room than the default.
  dialogClassName?: string
}

const EMPTY_TABLE_COLUMNS: ColumnDef<never>[] = [{ id: 'row' }]

// Shared list+CRUD-dialog chrome for Vanity's simple content collections
// (Services, Clients, Team, Articles, Portfolio, Testimonials, Pricing) —
// each vanity-backend module is a near-identical admin CRUD resource, so one
// generic page avoids seven duplicated list/dialog/delete-confirm implementations.
// Each resource still supplies its own form fields via `renderForm`. Search,
// pagination, and multi-select + bulk delete are handled here once, via
// @tanstack/react-table's row model (pagination/selection state only — visual
// cells still render through the `columns` render-prop, not react-table's
// column defs, so existing per-resource column arrays don't need to change).
export function ResourceCrudPage<T extends { id: string }, TForm>({
  title, description, queryKey, service, columns, readPermission, writePermission,
  emptyForm, toFormState, renderForm, getRowName, createLabel = 'Nouveau', isFormValid,
  searchPlaceholder = 'Rechercher…', searchFields, dialogClassName = 'max-w-3xl max-h-[88vh] overflow-y-auto',
}: ResourceCrudPageProps<T, TForm>) {
  const queryClient = useQueryClient()
  const { can } = usePermissions()
  const canRead = can(readPermission)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [form, setForm] = useState<TForm>(emptyForm)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const debouncedFilter = useDebounce(globalFilter, 300)

  // Gate the request itself, not just the UI — a role can have canView on
  // the section (route access) without the granular `readPermission` the
  // backend's PermissionsGuard independently requires on this endpoint.
  const { data: items, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: service.list,
    enabled: canRead,
  })

  const rows = items ?? []

  const filteredRows = useMemo(() => {
    const q = debouncedFilter.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const haystack = [getRowName(r), ...(searchFields ? searchFields(r) : [])]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [rows, debouncedFilter, getRowName, searchFields])

  const table = useReactTable({
    data: filteredRows,
    columns: EMPTY_TABLE_COLUMNS as ColumnDef<T>[],
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
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: T) => {
    setEditing(item)
    setForm(toFormState(item))
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: () => (editing ? service.update(editing.id, form) : service.create(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      toast.success(editing ? 'Mis à jour' : 'Créé')
      setDialogOpen(false)
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const deleteMutation = useMutation({
    mutationFn: service.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      toast.success('Supprimé')
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => service.remove(id))),
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      setRowSelection({})
      toast.success(`${ids.length} élément(s) supprimé(s)`)
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const colCount = columns.length + 2 // + select + actions

  if (!canRead) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Vous n'avez pas la permission de consulter cette section.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Can permission={writePermission}>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {createLabel}
            </Button>
          </Can>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-48 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">{selectedIds.length} sélectionné(s)</span>
                <Can permission={writePermission}>
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
                    <Can permission={writePermission} fallback={null}>
                      <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                      />
                    </Can>
                  </TableHead>
                  {columns.map((c) => (
                    <TableHead key={c.header} className={c.className}>{c.header}</TableHead>
                  ))}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }, (_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: colCount }, (_, j) => (
                        <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colCount} className="h-24 text-center text-muted-foreground">
                      Aucun résultat.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((row) => {
                    const item = row.original
                    return (
                      <TableRow key={item.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                        <TableCell>
                          <Can permission={writePermission} fallback={null}>
                            <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />
                          </Can>
                        </TableCell>
                        {columns.map((c) => (
                          <TableCell key={c.header} className={c.className}>{c.render(item)}</TableCell>
                        ))}
                        <TableCell>
                          <Can permission={writePermission}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(item)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteId(item.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={dialogClassName}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier' : createLabel}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">{renderForm(form, setForm)}</div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || (isFormValid ? !isFormValid(form) : false)}
            >
              {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Supprimer cet élément ?"
        description={
          deleteId
            ? `« ${getRowName(rows.find((r) => r.id === deleteId)!)} » sera définitivement supprimé.`
            : ''
        }
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
        title={`Supprimer ${selectedIds.length} élément(s) ?`}
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
