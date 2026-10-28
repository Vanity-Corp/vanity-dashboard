import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, Pencil, Trash2, GripVertical, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { RichTextField } from '@/components/shared/RichTextField'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/components/shared/Can'
import { pagesService } from '@/services/pages.service'
import { PERMISSIONS } from '@/lib/permissions'
import { slugify, cn } from '@/lib/utils'
import { ApiError } from '@/lib/api-client'
import type { Page, PageSection } from '@/types'

type BlockType = 'richSection' | 'clientsShowcase'

const BLOCK_LABELS: Record<BlockType, string> = {
  richSection: 'Section de texte',
  clientsShowcase: "Vitrine d'ils nous font confiance",
}

interface SectionForm {
  blockType: string
  key: string
  category: string
  eyebrow: string
  heading: string
  body: string
  items: string[]
  ctaLabel: string
  ctaHref: string
  maxItems: string
}

function toSectionForm(s: PageSection): SectionForm {
  const d = s.data ?? {}
  return {
    blockType: s.blockType,
    key: s.key ?? '',
    category: s.category ?? '',
    eyebrow: (d.eyebrow as string) ?? '',
    heading: (d.heading as string) ?? '',
    body: (d.body as string) ?? '',
    items: Array.isArray(d.items) ? (d.items as string[]) : [],
    ctaLabel: (d.ctaLabel as string) ?? '',
    ctaHref: (d.ctaHref as string) ?? '',
    maxItems: d.maxItems != null ? String(d.maxItems) : '',
  }
}

function newSection(blockType: BlockType): SectionForm {
  return {
    blockType, key: '', category: blockType === 'clientsShowcase' ? 'brand' : '',
    eyebrow: '', heading: '', body: '', items: [], ctaLabel: '', ctaHref: '', maxItems: '',
  }
}

interface PageForm {
  title: string
  slug: string
  seoMetaTitle: string
  seoMetaDescription: string
  sections: SectionForm[]
}

const emptyForm: PageForm = { title: '', slug: '', seoMetaTitle: '', seoMetaDescription: '', sections: [] }

// Structured block editor — each block's fields are real form inputs (text,
// rich text, a repeatable chip list) rather than a raw JSON textarea, while
// still preserving the exact `blockType`/`key`/`category`/`data` shape
// vanity-corp-site's rendering code depends on (see the migration plan's
// corp-site integration section: richSection keys about/worldmap/cta/team/hero,
// clientsShowcase categories brand/artist/strategic_client).
export function PagesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Page | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<PageForm>(emptyForm)
  const [expanded, setExpanded] = useState<number | null>(0)

  const { data: pages, isLoading } = useQuery({ queryKey: ['pages'], queryFn: pagesService.list })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setExpanded(null)
    setDialogOpen(true)
  }

  const openEdit = (page: Page) => {
    setEditing(page)
    setForm({
      title: page.title, slug: page.slug, seoMetaTitle: page.seoMetaTitle ?? '',
      seoMetaDescription: page.seoMetaDescription ?? '',
      sections: page.sections.map(toSectionForm),
    })
    setExpanded(0)
    setDialogOpen(true)
  }

  const updateSection = (i: number, patch: Partial<SectionForm>) => {
    const sections = [...form.sections]
    sections[i] = { ...sections[i], ...patch }
    setForm({ ...form, sections })
  }

  const addSection = (blockType: BlockType) => {
    setForm({ ...form, sections: [...form.sections, newSection(blockType)] })
    setExpanded(form.sections.length)
  }

  const moveSection = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= form.sections.length) return
    const sections = [...form.sections]
    ;[sections[i], sections[j]] = [sections[j], sections[i]]
    setForm({ ...form, sections })
    setExpanded(j)
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const sections = form.sections.map((s, i) => {
        const data: Record<string, unknown> = {}
        if (s.eyebrow) data.eyebrow = s.eyebrow
        if (s.heading) data.heading = s.heading
        if (s.blockType === 'richSection') {
          if (s.body) data.body = s.body
          if (s.items.length) data.items = s.items
          if (s.ctaLabel) data.ctaLabel = s.ctaLabel
          if (s.ctaHref) data.ctaHref = s.ctaHref
        }
        if (s.blockType === 'clientsShowcase' && s.maxItems) {
          data.maxItems = Number(s.maxItems)
        }
        return {
          blockType: s.blockType,
          key: s.key || undefined,
          category: s.category || undefined,
          order: i,
          data,
        }
      })
      const payload = {
        title: form.title,
        slug: form.slug,
        seoMetaTitle: form.seoMetaTitle || undefined,
        seoMetaDescription: form.seoMetaDescription || undefined,
        sections,
      }
      return editing ? pagesService.update(editing.id, payload) : pagesService.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      toast.success(editing ? 'Page mise à jour' : 'Page créée')
      setDialogOpen(false)
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const deleteMutation = useMutation({
    mutationFn: pagesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      toast.success('Page supprimée')
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const rows = pages ?? []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Pages</CardTitle>
            <CardDescription>
              Pages du site vitrine, composées de blocs de contenu.
            </CardDescription>
          </div>
          <Can permission={PERMISSIONS.pagesWrite}>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle page
            </Button>
          </Can>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Blocs</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }, (_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }, (_, j) => (
                        <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Aucune page.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell><code className="text-xs">{page.slug}</code></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{page.sections.length}</TableCell>
                      <TableCell>
                        <Can permission={PERMISSIONS.pagesWrite}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(page)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(page.id)}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[80vw] sm:max-w-[80vw] max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier la page' : 'Nouvelle page'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setForm({ ...form, title, slug: form.slug || slugify(title) })
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Titre SEO</Label>
                <Input value={form.seoMetaTitle} onChange={(e) => setForm({ ...form, seoMetaTitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description SEO</Label>
                <Input
                  value={form.seoMetaDescription}
                  onChange={(e) => setForm({ ...form, seoMetaDescription: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Blocs de contenu</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => addSection('richSection')}>
                    <Plus className="h-4 w-4 mr-1" /> Section de texte
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addSection('clientsShowcase')}>
                    <Plus className="h-4 w-4 mr-1" /> Vitrine clients
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {form.sections.map((section, i) => {
                  const isOpen = expanded === i
                  const label = BLOCK_LABELS[section.blockType as BlockType] ?? section.blockType
                  return (
                    <div key={i} className="rounded-md border">
                      <div className="flex items-center gap-2 p-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                        <button
                          type="button"
                          className="flex-1 flex items-center gap-2 text-left text-sm font-medium"
                          onClick={() => setExpanded(isOpen ? null : i)}
                        >
                          {label}
                          {section.heading && <span className="text-muted-foreground font-normal truncate">— {section.heading}</span>}
                        </button>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => moveSection(i, -1)} disabled={i === 0}>
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => moveSection(i, 1)} disabled={i === form.sections.length - 1}>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button" variant="ghost" size="icon-sm"
                          onClick={() => setForm({ ...form, sections: form.sections.filter((_, j) => j !== i) })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {isOpen && (
                        <div className={cn('space-y-3 border-t p-3')}>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Emplacement (key)</Label>
                              <Input
                                placeholder="about, hero, cta…"
                                value={section.key}
                                onChange={(e) => updateSection(i, { key: e.target.value })}
                              />
                            </div>
                            {section.blockType === 'clientsShowcase' ? (
                              <div className="space-y-1">
                                <Label className="text-xs">Catégorie de clients</Label>
                                <Select value={section.category} onValueChange={(v) => updateSection(i, { category: v })}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="brand">Marques</SelectItem>
                                    <SelectItem value="artist">Artistes</SelectItem>
                                    <SelectItem value="strategic_client">Clients stratégiques</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <Label className="text-xs">Eyebrow</Label>
                                <Input value={section.eyebrow} onChange={(e) => updateSection(i, { eyebrow: e.target.value })} />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Titre</Label>
                            <Input value={section.heading} onChange={(e) => updateSection(i, { heading: e.target.value })} />
                          </div>

                          {section.blockType === 'richSection' && (
                            <>
                              <div className="space-y-1">
                                <Label className="text-xs">Texte</Label>
                                <RichTextField value={section.body} onChange={(body) => updateSection(i, { body })} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Points clés</Label>
                                <div className="flex flex-wrap gap-2">
                                  {section.items.map((item, itemIdx) => (
                                    <span key={itemIdx} className="flex items-center gap-1 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                                      {item}
                                      <button
                                        type="button"
                                        onClick={() => updateSection(i, { items: section.items.filter((_, k) => k !== itemIdx) })}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <Input
                                  placeholder="Ajouter un point et appuyer sur Entrée"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                      e.preventDefault()
                                      updateSection(i, { items: [...section.items, e.currentTarget.value.trim()] })
                                      e.currentTarget.value = ''
                                    }
                                  }}
                                />
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Bouton — libellé</Label>
                                  <Input value={section.ctaLabel} onChange={(e) => updateSection(i, { ctaLabel: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Bouton — lien</Label>
                                  <Input value={section.ctaHref} onChange={(e) => updateSection(i, { ctaHref: e.target.value })} />
                                </div>
                              </div>
                            </>
                          )}

                          {section.blockType === 'clientsShowcase' && (
                            <div className="space-y-1">
                              <Label className="text-xs">Nombre maximum affiché</Label>
                              <Input
                                type="number"
                                value={section.maxItems}
                                onChange={(e) => updateSection(i, { maxItems: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
                {form.sections.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">Aucun bloc — ajoutez-en un ci-dessus.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!form.title.trim() || !form.slug.trim() || saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Supprimer cette page ?"
        description="Cette action est irréversible."
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
