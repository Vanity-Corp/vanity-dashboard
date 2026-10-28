import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { mediaService } from '@/services/media.service'
import { API_URL } from '@/lib/api-client'

function mediaUrl(url: string): string {
  return url.startsWith('http') ? url : `${API_URL}${url}`
}

interface MediaPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
}

// "Pick an existing file" half of the upload-new-OR-pick-existing pattern —
// pairs with ImageUploadField, which opens this instead of re-uploading a
// file that's already in the Médiathèque.
export function MediaPickerDialog({ open, onOpenChange, onSelect }: MediaPickerDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: mediaService.list,
    enabled: open,
  })

  const items = (data ?? []).filter((m) => m.mimeType?.startsWith('image/'))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choisir depuis la médiathèque</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Chargement…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Aucune image dans la médiathèque.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                className="aspect-square rounded-md border overflow-hidden hover:ring-2 hover:ring-primary transition-shadow"
                onClick={() => {
                  onSelect(mediaUrl(m.url))
                  onOpenChange(false)
                }}
              >
                <img src={mediaUrl(m.url)} alt={m.alt ?? ''} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
