import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ResourceCrudPage } from '@/components/shared/ResourceCrudPage'
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { testimonialsService } from '@/services/testimonials.service'
import { PERMISSIONS } from '@/lib/permissions'
import type { Testimonial } from '@/types'

interface TestimonialForm {
  name: string
  role: string
  company: string
  photoUrl: string
  quote: string
  sortOrder: number
}

const emptyForm: TestimonialForm = { name: '', role: '', company: '', photoUrl: '', quote: '', sortOrder: 0 }

export function TestimonialsPage() {
  return (
    <ResourceCrudPage<Testimonial, TestimonialForm>
      title="Témoignages"
      description="Avis clients affichés sur le site."
      queryKey="testimonials"
      service={testimonialsService}
      readPermission={PERMISSIONS.testimonialsRead}
      writePermission={PERMISSIONS.testimonialsWrite}
      createLabel="Nouveau témoignage"
      searchPlaceholder="Rechercher un témoignage…"
      searchFields={(t) => [t.company ?? '', t.role ?? '']}
      emptyForm={emptyForm}
      isFormValid={(f) => !!f.name.trim() && !!f.quote.trim()}
      getRowName={(t) => t.name}
      toFormState={(t) => ({
        name: t.name, role: t.role ?? '', company: t.company ?? '', photoUrl: t.photoUrl ?? '',
        quote: t.quote, sortOrder: t.sortOrder,
      })}
      columns={[
        { header: 'Nom', render: (t) => <span className="font-medium">{t.name}</span> },
        { header: 'Entreprise', render: (t) => t.company ?? '—' },
        { header: 'Ordre', render: (t) => t.sortOrder },
      ]}
      renderForm={(form, setForm) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Entreprise</Label>
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <ImageUploadField
            label="Photo"
            value={form.photoUrl}
            onChange={(photoUrl) => setForm({ ...form, photoUrl })}
          />
          <div className="space-y-2">
            <Label>Citation</Label>
            <Textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
          </div>
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
