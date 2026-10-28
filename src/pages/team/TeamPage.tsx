import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ResourceCrudPage } from '@/components/shared/ResourceCrudPage'
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { teamService } from '@/services/team.service'
import { PERMISSIONS } from '@/lib/permissions'
import type { TeamMember } from '@/types'

interface TeamForm {
  name: string
  position: string
  imageUrl: string
  bio: string
  sortOrder: number
}

const emptyForm: TeamForm = { name: '', position: '', imageUrl: '', bio: '', sortOrder: 0 }

export function TeamPage() {
  return (
    <ResourceCrudPage<TeamMember, TeamForm>
      title="Équipe"
      description="Les membres de l'équipe affichés sur le site."
      queryKey="team-members"
      service={teamService}
      readPermission={PERMISSIONS.teamRead}
      writePermission={PERMISSIONS.teamWrite}
      createLabel="Nouveau membre"
      searchPlaceholder="Rechercher un membre de l'équipe…"
      searchFields={(m) => [m.position ?? '']}
      emptyForm={emptyForm}
      isFormValid={(f) => !!f.name.trim()}
      getRowName={(m) => m.name}
      toFormState={(m) => ({
        name: m.name, position: m.position ?? '', imageUrl: m.imageUrl ?? '',
        bio: m.bio ?? '', sortOrder: m.sortOrder,
      })}
      columns={[
        { header: 'Nom', render: (m) => <span className="font-medium">{m.name}</span> },
        { header: 'Poste', render: (m) => m.position ?? '—' },
        { header: 'Ordre', render: (m) => m.sortOrder },
      ]}
      renderForm={(form, setForm) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Poste</Label>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            </div>
          </div>
          <ImageUploadField
            label="Photo"
            value={form.imageUrl}
            onChange={(imageUrl) => setForm({ ...form, imageUrl })}
          />
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
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
