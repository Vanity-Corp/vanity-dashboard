import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { rolesService } from '@/services/roles.service'
import type { Role, RoleSectionAccess } from '@/types'
import { NAV_SECTIONS } from '@/lib/nav-sections'
import { ApiError } from '@/lib/api-client'

type SectionMatrix = Record<string, { canView: boolean; canEdit: boolean }>

function emptyMatrix(): SectionMatrix {
  return Object.fromEntries(NAV_SECTIONS.map((s) => [s.key, { canView: false, canEdit: false }]))
}

function matrixFromRole(role: Role): SectionMatrix {
  const matrix = emptyMatrix()
  for (const s of role.sections) {
    matrix[s.section] = { canView: s.canView, canEdit: s.canEdit }
  }
  return matrix
}

function matrixToSections(matrix: SectionMatrix): RoleSectionAccess[] {
  return Object.entries(matrix).map(([section, access]) => ({ section, ...access }))
}

export function RolesSettings() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [matrix, setMatrix] = useState<SectionMatrix>(emptyMatrix())

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.list,
  })

  const openCreate = () => {
    setEditing(null)
    setName('')
    setDescription('')
    setMatrix(emptyMatrix())
    setDialogOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditing(role)
    setName(role.name)
    setDescription(role.description ?? '')
    setMatrix(matrixFromRole(role))
    setDialogOpen(true)
  }

  const setAccess = (section: string, key: 'canView' | 'canEdit', value: boolean) => {
    setMatrix((m) => {
      const next = { ...m[section], [key]: value }
      if (key === 'canEdit' && value) next.canView = true
      if (key === 'canView' && !value) next.canEdit = false
      return { ...m, [section]: next }
    })
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        sections: matrixToSections(matrix),
      }
      return editing ? rolesService.update(editing.id, payload) : rolesService.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success(editing ? 'Rôle mis à jour' : 'Rôle créé')
      setDialogOpen(false)
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const deleteMutation = useMutation({
    mutationFn: rolesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rôle supprimé')
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  useEffect(() => {
    if (!dialogOpen) setEditing(null)
  }, [dialogOpen])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Rôles</CardTitle>
            <CardDescription>
              Chaque rôle contrôle les sections visibles du tableau de bord
              (lecture / modification).
            </CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau rôle
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Membres</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }, (_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }, (_, j) => (
                        <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (roles ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Aucun rôle.
                    </TableCell>
                  </TableRow>
                ) : (
                  (roles ?? []).map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {role.name}
                          {role.isSystem && (
                            <Badge variant="outline" className="gap-1 text-[10px]">
                              <ShieldCheck className="h-3 w-3" />
                              Système
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {role.description || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {role._count?.users ?? 0}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(role)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(role.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le rôle' : 'Nouveau rôle'}</DialogTitle>
            <DialogDescription>
              Sections visibles de ce rôle.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Stagiaire" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Accès par section</Label>
              <div className="rounded-md border divide-y">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-2 text-xs font-medium text-muted-foreground">
                  <span>Section</span>
                  <span className="w-16 text-center">Voir</span>
                  <span className="w-20 text-center">Modifier</span>
                </div>
                {NAV_SECTIONS.map((s) => (
                  <div key={s.key} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-3 py-2">
                    <span className="text-sm">{s.label}</span>
                    <div className="w-16 flex justify-center">
                      <Switch
                        checked={matrix[s.key]?.canView ?? false}
                        onCheckedChange={(v) => setAccess(s.key, 'canView', v)}
                      />
                    </div>
                    <div className="w-20 flex justify-center">
                      <Switch
                        checked={matrix[s.key]?.canEdit ?? false}
                        onCheckedChange={(v) => setAccess(s.key, 'canEdit', v)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!name.trim() || saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Supprimer ce rôle ?"
        description="Impossible si des membres l'utilisent encore. Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId)
            setDeleteId(null)
          }
        }}
      />
    </div>
  )
}
