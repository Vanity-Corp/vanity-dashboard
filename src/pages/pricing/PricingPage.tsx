import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ResourceCrudPage } from '@/components/shared/ResourceCrudPage'
import { pricingService } from '@/services/pricing.service'
import { PERMISSIONS } from '@/lib/permissions'
import type { PricingPackage } from '@/types'

interface PricingForm {
  title: string
  price: number | undefined
  features: string[]
  highlighted: boolean
  sortOrder: number
}

const emptyForm: PricingForm = { title: '', price: undefined, features: [], highlighted: false, sortOrder: 0 }

export function PricingPage() {
  return (
    <ResourceCrudPage<PricingPackage, PricingForm>
      title="Tarifs"
      description="Offres tarifaires affichées sur le site."
      queryKey="pricing"
      service={pricingService}
      readPermission={PERMISSIONS.pricingRead}
      writePermission={PERMISSIONS.pricingWrite}
      createLabel="Nouvelle offre"
      searchPlaceholder="Rechercher une offre…"
      emptyForm={emptyForm}
      isFormValid={(f) => !!f.title.trim()}
      getRowName={(p) => p.title}
      toFormState={(p) => ({
        title: p.title, price: p.price ?? undefined, features: p.features,
        highlighted: p.highlighted, sortOrder: p.sortOrder,
      })}
      columns={[
        { header: 'Offre', render: (p) => <span className="font-medium">{p.title}</span> },
        { header: 'Prix', render: (p) => (p.price != null ? `${p.price} €` : '—') },
        { header: 'Mise en avant', render: (p) => (p.highlighted ? 'Oui' : 'Non') },
      ]}
      renderForm={(form, setForm) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Prix (€)</Label>
              <Input
                type="number"
                value={form.price ?? ''}
                onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.highlighted} onCheckedChange={(v) => setForm({ ...form, highlighted: v })} />
            <Label>Mettre en avant</Label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Caractéristiques incluses</Label>
              <Button
                type="button" variant="outline" size="sm"
                onClick={() => setForm({ ...form, features: [...form.features, ''] })}
              >
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={f}
                    onChange={(e) => {
                      const features = [...form.features]
                      features[i] = e.target.value
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
