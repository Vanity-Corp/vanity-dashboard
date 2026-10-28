import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ImageUp, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Can } from '@/components/shared/Can'
import { mediaService } from '@/services/media.service'
import { PERMISSIONS } from '@/lib/permissions'
import { API_URL, ApiError } from '@/lib/api-client'
import { cn, formatBytes } from '@/lib/utils'

const ACCEPTED_TYPES = ['image/png', 'image/webp', 'image/jpeg', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024;

function mediaUrl(url: string): string {
  return url.startsWith('http') ? url : `${API_URL}${url}`
}

export function MediaPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['media'], queryFn: mediaService.list })
  const { data: usage } = useQuery({ queryKey: ['media', 'usage'], queryFn: mediaService.usage })

  const deleteMutation = useMutation({
    mutationFn: mediaService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      queryClient.invalidateQueries({ queryKey: ['media', 'usage'] })
      toast.success('Fichier supprimé')
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Erreur.'),
  })

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList)
    const accepted = files.filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast.error(`${f.name} : format non supporté.`)
        return false
      }
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} : fichier trop volumineux (5 Mo max).`)
        return false
      }
      return true
    })
    if (accepted.length === 0) return

    setUploading(true)
    const results = await Promise.allSettled(accepted.map((f) => mediaService.upload(f)))
    setUploading(false)

    const ok = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.length - ok
    queryClient.invalidateQueries({ queryKey: ['media'] })
    queryClient.invalidateQueries({ queryKey: ['media', 'usage'] })
    if (ok > 0) toast.success(`${ok} image(s) ajoutée(s).${failed ? ` ${failed} échec(s).` : ''}`)
    else if (failed > 0) toast.error(`${failed} envoi(s) ont échoué.`)
  }

  const items = data ?? []

  return (
    <div className="space-y-6">
      {usage && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Stockage utilisé</span>
              <span className="text-muted-foreground">
                {formatBytes(usage.usedBytes)}
                {usage.limitBytes ? ` / ${formatBytes(usage.limitBytes)}` : ''}
              </span>
            </div>
            {usage.limitBytes ? (
              <Progress
                value={usage.usedPercent ?? 0}
                className={cn((usage.usedPercent ?? 0) >= 90 && '[&>div]:bg-destructive')}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                Aucune limite définie — indiquez-en une dans Paramètres → Intégrations pour suivre le quota.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Média</CardTitle>
          <CardDescription>Images et fichiers utilisés sur le site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Can permission={PERMISSIONS.mediaWrite}>
            <div
              className={cn(
                'flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors',
                dragOver ? 'border-primary bg-primary/5' : 'border-input',
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files)
              }}
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <ImageUp className="h-6 w-6 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground">
                Glissez-déposez des images ici, ou cliquez pour en choisir
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES.join(',')}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) void handleFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>
          </Can>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="aspect-square" />)}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Aucun fichier.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {items.map((m) => (
                <div key={m.id} className="group relative rounded-md border overflow-hidden aspect-square">
                  {m.mimeType?.startsWith('image/') ? (
                    <img src={mediaUrl(m.url)} alt={m.alt ?? ''} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">
                      {m.filename}
                    </div>
                  )}
                  <Can permission={PERMISSIONS.mediaWrite}>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDeleteId(m.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Can>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Supprimer ce fichier ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId)
            setDeleteId(null)
          }
        }}
      />
    </div>
  )
}
