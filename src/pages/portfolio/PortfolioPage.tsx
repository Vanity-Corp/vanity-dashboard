import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResourceCrudPage } from '@/components/shared/ResourceCrudPage'
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { portfolioService } from '@/services/portfolio.service'
import { PERMISSIONS } from '@/lib/permissions'
import { slugify } from '@/lib/utils'
import type { PortfolioProject, PortfolioCategory } from '@/types'

interface PortfolioForm {
  title: string
  slug: string
  client: string
  description: string
  coverUrl: string
  gallery: string[]
  category: PortfolioCategory
  videoUrl: string
  sortOrder: number
  year: number | undefined
  services: string[]
  need: string
  approach: string
  result: string
}

const emptyForm: PortfolioForm = {
  title: '', slug: '', client: '', description: '', coverUrl: '', gallery: [],
  category: 'VIDEO', videoUrl: '', sortOrder: 0,
  year: undefined, services: [], need: '', approach: '', result: '',
}

const CATEGORY_LABELS: Record<PortfolioCategory, string> = {
  VIDEO: 'Vidéo',
  GRAPHISME: 'Graphisme',
  SHOOTING: 'Shooting photo',
  SITE_WEB: 'Site internet',
  STRATEGIE: 'Accompagnement stratégique',
  RESEAUX_SOCIAUX: 'Réseaux sociaux',
}

export function PortfolioPage() {
  return (
    <ResourceCrudPage<PortfolioProject, PortfolioForm>
      title="Portfolio"
      description="Projets réalisés, présentés sur le site vitrine."
      queryKey="portfolio"
      service={portfolioService}
      readPermission={PERMISSIONS.portfolioRead}
      writePermission={PERMISSIONS.portfolioWrite}
      createLabel="Nouveau projet"
      searchPlaceholder="Rechercher un projet…"
      searchFields={(p) => [p.slug, p.client ?? '']}
      emptyForm={emptyForm}
      isFormValid={(f) => !!f.title.trim() && !!f.slug.trim()}
      getRowName={(p) => p.title}
      toFormState={(p) => ({
        title: p.title, slug: p.slug, client: p.client ?? '', description: p.description ?? '',
        coverUrl: p.coverUrl ?? '', gallery: p.gallery ?? [],
        category: p.category, videoUrl: p.videoUrl ?? '', sortOrder: p.sortOrder,
        year: p.year ?? undefined, services: p.services ?? [],
        need: p.need ?? '', approach: p.approach ?? '', result: p.result ?? '',
      })}
      columns={[
        { header: 'Titre', render: (p) => <span className="font-medium">{p.title}</span> },
        { header: 'Catégorie', render: (p) => <Badge variant="outline">{CATEGORY_LABELS[p.category]}</Badge> },
        { header: 'Client', render: (p) => p.client ?? '—' },
        { header: 'Ordre', render: (p) => p.sortOrder },
      ]}
      renderForm={(form, setForm) => (
        <>
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
              <Label>Catégorie</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as PortfolioCategory })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as PortfolioCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Client</Label>
              <Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Année</Label>
              <Input
                type="number"
                value={form.year ?? ''}
                onChange={(e) => setForm({ ...form, year: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Services (séparés par des virgules)</Label>
              <Input
                value={form.services.join(', ')}
                onChange={(e) => setForm({
                  ...form,
                  services: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })}
                placeholder="Production, Montage"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Le besoin</Label>
            <Textarea
              value={form.need}
              onChange={(e) => setForm({ ...form, need: e.target.value })}
              placeholder="1 phrase courte — laisser vide pour ne pas afficher ce bloc."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Notre approche</Label>
            <Textarea
              value={form.approach}
              onChange={(e) => setForm({ ...form, approach: e.target.value })}
              placeholder="1 phrase courte — laisser vide pour ne pas afficher ce bloc."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Le résultat</Label>
            <Textarea
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value })}
              placeholder="1 phrase courte — laisser vide pour ne pas afficher ce bloc. Non affiché pour la catégorie Shooting photo."
              rows={2}
            />
          </div>
          <ImageUploadField
            label="Image de couverture"
            value={form.coverUrl}
            onChange={(coverUrl) => setForm({ ...form, coverUrl })}
          />
          {form.category === 'VIDEO' ? (
            <div className="space-y-2">
              <Label>Lien vidéo (YouTube)</Label>
              <Input
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://youtu.be/…"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Galerie d'images (une URL par ligne)</Label>
              <Textarea
                value={form.gallery.join('\n')}
                onChange={(e) => setForm({ ...form, gallery: e.target.value.split('\n') })}
                onBlur={(e) => setForm({
                  ...form,
                  gallery: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                })}
                placeholder={'https://…/image1.webp\nhttps://…/image2.webp'}
                rows={4}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Ordre d'affichage</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </div>
        </>
      )}
    />
  )
}
