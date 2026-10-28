import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ResourceCrudPage } from '@/components/shared/ResourceCrudPage'
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { portfolioService } from '@/services/portfolio.service'
import { PERMISSIONS } from '@/lib/permissions'
import { slugify } from '@/lib/utils'
import type { PortfolioProject } from '@/types'

interface PortfolioForm {
  title: string
  slug: string
  client: string
  description: string
  coverUrl: string
  sortOrder: number
}

const emptyForm: PortfolioForm = { title: '', slug: '', client: '', description: '', coverUrl: '', sortOrder: 0 }

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
        coverUrl: p.coverUrl ?? '', sortOrder: p.sortOrder,
      })}
      columns={[
        { header: 'Titre', render: (p) => <span className="font-medium">{p.title}</span> },
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
          <div className="space-y-2">
            <Label>Client</Label>
            <Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <ImageUploadField
            label="Image de couverture"
            value={form.coverUrl}
            onChange={(coverUrl) => setForm({ ...form, coverUrl })}
          />
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
