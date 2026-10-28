import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { settingsService } from '@/services/settings.service'
import { ApiError } from '@/lib/api-client'
import type { BrandingConfig } from '@/types'

export function GeneralSettings() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<BrandingConfig | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['branding'], queryFn: settingsService.getBrandingPublic })

  useEffect(() => {
    if (data && !form) setForm(data)
  }, [data, form])

  const saveMutation = useMutation({
    mutationFn: (payload: BrandingConfig) => settingsService.setBranding(payload),
    onSuccess: (saved) => {
      setForm(saved)
      queryClient.invalidateQueries({ queryKey: ['branding'] })
      toast.success('Marque mise à jour')
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  if (isLoading || !form) return <Skeleton className="h-40 w-full" />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Général</CardTitle>
        <CardDescription>Titre et logo du tableau de bord.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Titre du tableau de bord</Label>
          <Input value={form.dashboardTitle} onChange={(e) => setForm({ ...form, dashboardTitle: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Logo (URL)</Label>
          <Input value={form.dashboardLogoUrl} onChange={(e) => setForm({ ...form, dashboardLogoUrl: e.target.value })} />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
