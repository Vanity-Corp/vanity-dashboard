import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResourceCrudPage } from '@/components/shared/ResourceCrudPage'
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { clientsService } from '@/services/clients.service'
import { PERMISSIONS } from '@/lib/permissions'
import type { Client, ClientCategory } from '@/types'

interface ClientForm {
  name: string
  imageUrl: string
  link: string
  sector: string
  focus: string
  category: ClientCategory
  active: boolean
  sortOrder: number
}

const emptyForm: ClientForm = {
  name: '', imageUrl: '', link: '', sector: '', focus: '', category: 'BRAND', active: true, sortOrder: 0,
}

const CATEGORY_LABELS: Record<ClientCategory, string> = {
  BRAND: 'Marque',
  ARTIST: 'Artiste',
  STRATEGIC_CLIENT: 'Client stratégique',
}

export function ClientsPage() {
  return (
    <ResourceCrudPage<Client, ClientForm>
      title="Clients"
      description="Marques, artistes et clients stratégiques affichés sur le site."
      queryKey="clients"
      service={clientsService}
      readPermission={PERMISSIONS.clientsRead}
      writePermission={PERMISSIONS.clientsWrite}
      createLabel="Nouveau client"
      searchPlaceholder="Rechercher un client…"
      searchFields={(c) => [c.sector ?? '', c.focus ?? '']}
      emptyForm={emptyForm}
      isFormValid={(f) => !!f.name.trim()}
      getRowName={(c) => c.name}
      toFormState={(c) => ({
        name: c.name, imageUrl: c.imageUrl ?? '', link: c.link ?? '', sector: c.sector ?? '',
        focus: c.focus ?? '', category: c.category, active: c.active, sortOrder: c.sortOrder,
      })}
      columns={[
        { header: 'Nom', render: (c) => <span className="font-medium">{c.name}</span> },
        { header: 'Catégorie', render: (c) => <Badge variant="outline">{CATEGORY_LABELS[c.category]}</Badge> },
        { header: 'Actif', render: (c) => (c.active ? 'Oui' : 'Non') },
        { header: 'Ordre', render: (c) => c.sortOrder },
      ]}
      renderForm={(form, setForm) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ClientCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as ClientCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ImageUploadField
            label="Logo"
            value={form.imageUrl}
            onChange={(imageUrl) => setForm({ ...form, imageUrl })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Lien</Label>
              <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Secteur</Label>
              <Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />
            </div>
          </div>
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
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label>Actif</Label>
            </div>
          </div>
        </>
      )}
    />
  )
}
