import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResourceCrudPage } from '@/components/shared/ResourceCrudPage'
import { pricingService } from '@/services/pricing.service'
import { PERMISSIONS } from '@/lib/permissions'
import type { PricingPackage, PricingCategory } from '@/types'

const CATEGORY_LABELS: Record<PricingCategory, string> = {
  AUDIO: 'Audio',
  FILMING: 'Tournage',
  TURNKEY: 'Clé en main',
}

interface PricingForm {
  category: PricingCategory
  title: string
  description: string
  price: number | undefined
  pricePrefix: string
  features: string[]
  highlighted: boolean
  sortOrder: number
}

const emptyForm: PricingForm = {
  category: 'AUDIO', title: '', description: '', price: undefined, pricePrefix: '',
  features: [], highlighted: false, sortOrder: 0,
}

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
        category: p.category, title: p.title, description: p.description ?? '',
        price: p.price ?? undefined, pricePrefix: p.pricePrefix ?? '',
        features: p.features, highlighted: p.highlighted, sortOrder: p.sortOrder,
      })}
      columns={[
        { header: 'Catégorie', render: (p) => <Badge variant="outline">{CATEGORY_LABELS[p.category]}</Badge> },
        { header: 'Offre', render: (p) => <span className="font-medium">{p.title}</span> },
        { header: 'Prix', render: (p) => (p.price != null ? `${p.pricePrefix ? p.pricePrefix + ' ' : ''}${p.price} €` : '—') },
        { header: 'Mise en avant', render: (p) => (p.highlighted ? 'Oui' : 'Non') },
      ]}
      renderForm={(form, setForm) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as PricingCategory })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as PricingCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Prix (€)</Label>
              <Input
                type="number"
                value={form.price ?? ''}
                onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label>Préfixe du prix (optionnel)</Label>
              <Input
                placeholder="À partir de"
                value={form.pricePrefix}
                onChange={(e) => setForm({ ...form, pricePrefix: e.target.value })}
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
