import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { settingsService } from '@/services/settings.service'
import { ApiError } from '@/lib/api-client'
import type { IntegrationsConfig } from '@/types'

// Secrets arrive masked (e.g. "••••-123") from GET /settings/integrations —
// hardened vs. Scolaris_backend's equivalent, which returns every secret in
// full to any dashboard account (see the migration plan). Loading the
// "reveal" endpoint (settings.manage-gated) is a deliberate separate action,
// not automatic on page load.
export function IntegrationsSettings() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<IntegrationsConfig | null>(null)
  const [revealed, setRevealed] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'integrations'],
    queryFn: settingsService.getIntegrations,
  })

  useEffect(() => {
    if (data && !form) setForm(data)
  }, [data, form])

  const revealMutation = useMutation({
    mutationFn: settingsService.getIntegrationsFull,
    onSuccess: (full) => {
      setForm(full)
      setRevealed(true)
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: IntegrationsConfig) => settingsService.setIntegrations(payload),
    onSuccess: (saved) => {
      setForm(saved)
      setRevealed(false)
      queryClient.invalidateQueries({ queryKey: ['settings', 'integrations'] })
      toast.success('Intégrations mises à jour')
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  if (isLoading || !form) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    )
  }

  const set = <K extends keyof IntegrationsConfig>(key: K, value: IntegrationsConfig[K]) =>
    setForm({ ...form, [key]: value })

  return (
    <div className="space-y-6">
      {!revealed && (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3 text-sm">
          <span>Les secrets sont masqués. Cliquez pour les afficher avant modification.</span>
          <Button size="sm" variant="outline" onClick={() => revealMutation.mutate()} disabled={revealMutation.isPending}>
            Afficher les secrets
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stockage média</CardTitle>
          <CardDescription>Où sont stockés les fichiers envoyés depuis Média.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Fournisseur</Label>
              <Select value={form.storageProvider} onValueChange={(v) => set('storageProvider', v as IntegrationsConfig['storageProvider'])}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local (disque)</SelectItem>
                  <SelectItem value="cloudinary">Cloudinary</SelectItem>
                  <SelectItem value="s3">S3 compatible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Limite de stockage (Go)</Label>
              <Input
                type="number"
                min={0}
                value={form.storageLimitGb}
                onChange={(e) => set('storageLimitGb', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">0 = aucune limite.</p>
            </div>
          </div>
          {form.storageProvider === 'cloudinary' && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Cloud name</Label>
                <Input value={form.cloudinaryCloudName} onChange={(e) => set('cloudinaryCloudName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>API key</Label>
                <Input value={form.cloudinaryApiKey} onChange={(e) => set('cloudinaryApiKey', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>API secret</Label>
                <Input type="password" value={form.cloudinaryApiSecret} onChange={(e) => set('cloudinaryApiSecret', e.target.value)} />
              </div>
            </div>
          )}
          {form.storageProvider === 's3' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Endpoint</Label><Input value={form.s3Endpoint} onChange={(e) => set('s3Endpoint', e.target.value)} /></div>
              <div className="space-y-2"><Label>Région</Label><Input value={form.s3Region} onChange={(e) => set('s3Region', e.target.value)} /></div>
              <div className="space-y-2"><Label>Bucket</Label><Input value={form.s3Bucket} onChange={(e) => set('s3Bucket', e.target.value)} /></div>
              <div className="space-y-2"><Label>URL publique</Label><Input value={form.s3PublicUrl} onChange={(e) => set('s3PublicUrl', e.target.value)} /></div>
              <div className="space-y-2"><Label>Access key ID</Label><Input value={form.s3AccessKeyId} onChange={(e) => set('s3AccessKeyId', e.target.value)} /></div>
              <div className="space-y-2"><Label>Secret access key</Label><Input type="password" value={form.s3SecretAccessKey} onChange={(e) => set('s3SecretAccessKey', e.target.value)} /></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email (SMTP)</CardTitle>
          <CardDescription>Notifications de demandes et réinitialisation de mot de passe.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Hôte SMTP</Label><Input value={form.smtpHost} onChange={(e) => set('smtpHost', e.target.value)} /></div>
          <div className="space-y-2"><Label>Port</Label><Input type="number" value={form.smtpPort} onChange={(e) => set('smtpPort', Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Utilisateur</Label><Input value={form.smtpUser} onChange={(e) => set('smtpUser', e.target.value)} /></div>
          <div className="space-y-2"><Label>Mot de passe</Label><Input type="password" value={form.smtpPassword} onChange={(e) => set('smtpPassword', e.target.value)} /></div>
          <div className="space-y-2"><Label>Adresse d'expédition</Label><Input value={form.smtpFrom} onChange={(e) => set('smtpFrom', e.target.value)} /></div>
          <div className="space-y-2"><Label>Nom d'expédition</Label><Input value={form.smtpFromName} onChange={(e) => set('smtpFromName', e.target.value)} /></div>
          <div className="flex items-center gap-2 pt-6">
            <Switch checked={form.smtpSecure} onCheckedChange={(v) => set('smtpSecure', v)} />
            <Label>Connexion sécurisée (TLS)</Label>
          </div>
          <div className="space-y-2"><Label>Email notif. contact</Label><Input value={form.contactNotificationEmail} onChange={(e) => set('contactNotificationEmail', e.target.value)} /></div>
          <div className="space-y-2"><Label>Email notif. devis</Label><Input value={form.quoteNotificationEmail} onChange={(e) => set('quoteNotificationEmail', e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Site vitrine (vanity-corp-site)</CardTitle>
          <CardDescription>
            Jeton partagé pour les formulaires publics et revalidation du cache du site.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>URL du site</Label><Input value={form.corpSiteUrl} onChange={(e) => set('corpSiteUrl', e.target.value)} /></div>
          <div className="space-y-2"><Label>Jeton de formulaire</Label><Input type="password" value={form.formSubmissionToken} onChange={(e) => set('formSubmissionToken', e.target.value)} /></div>
          <div className="space-y-2"><Label>Secret de revalidation</Label><Input type="password" value={form.revalidateSecret} onChange={(e) => set('revalidateSecret', e.target.value)} /></div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer les intégrations'}
        </Button>
      </div>
    </div>
  )
}
