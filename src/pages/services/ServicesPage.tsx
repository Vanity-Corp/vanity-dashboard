import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ResourceCrudPage } from '@/components/shared/ResourceCrudPage'
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { servicesService } from '@/services/services.service'
import { PERMISSIONS } from '@/lib/permissions'
import { slugify } from '@/lib/utils'
import type { Service, ServiceFeature } from '@/types'

interface ServiceForm {
  title: string
  slug: string
  eyebrow: string
  description: string
  imageUrl: string
  reverse: boolean
  sortOrder: number
  features: ServiceFeature[]
}

const emptyForm: ServiceForm = {
  title: '', slug: '', eyebrow: '', description: '', imageUrl: '', reverse: false, sortOrder: 0, features: [],
}

export function ServicesPage() {
  return (
    <ResourceCrudPage<Service, ServiceForm>
      title="Services"
      description="Les prestations proposées, affichées sur le site vitrine."
      queryKey="services"
      service={servicesService}
      readPermission={PERMISSIONS.servicesRead}
      writePermission={PERMISSIONS.servicesWrite}
      createLabel="Nouveau service"
      searchPlaceholder="Rechercher un service…"
      searchFields={(s) => [s.slug, s.eyebrow ?? '']}
      emptyForm={emptyForm}
      isFormValid={(f) => !!f.title.trim() && !!f.slug.trim()}
      getRowName={(s) => s.title}
      toFormState={(s) => ({
        title: s.title, slug: s.slug, eyebrow: s.eyebrow ?? '', description: s.description ?? '',
        imageUrl: s.imageUrl ?? '', reverse: s.reverse, sortOrder: s.sortOrder, features: s.features,
      })}
      columns={[
        { header: 'Titre', render: (s) => <span className="font-medium">{s.title}</span> },
        { header: 'Slug', render: (s) => <code className="text-xs">{s.slug}</code> },
        { header: 'Ordre', render: (s) => s.sortOrder },
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
            <Label>Eyebrow</Label>
            <Input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <ImageUploadField value={form.imageUrl} onChange={(imageUrl) => setForm({ ...form, imageUrl })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Ordre d'affichage</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={form.reverse} onCheckedChange={(v) => setForm({ ...form, reverse: v })} />
              <Label>Inverser la mise en page</Label>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Caractéristiques</Label>
              <Button
                type="button" variant="outline" size="sm"
                onClick={() => setForm({ ...form, features: [...form.features, { name: '', description: '' }] })}
              >
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Nom"
                    value={f.name}
                    onChange={(e) => {
                      const features = [...form.features]
                      features[i] = { ...f, name: e.target.value }
                      setForm({ ...form, features })
                    }}
                  />
                  <Input
                    placeholder="Description"
                    value={f.description ?? ''}
                    onChange={(e) => {
                      const features = [...form.features]
                      features[i] = { ...f, description: e.target.value }
                      setForm({ ...form, features })
                    }}
                  />
                  <Button
                    type="button" variant="ghost" size="icon-sm"
                    onClick={() => setForm({ ...form, features: form.features.filter((_, j) => j !== i) })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    />
  )
}
