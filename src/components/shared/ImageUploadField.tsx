import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ImageUp, Loader2, X, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MediaPickerDialog } from '@/components/shared/MediaPickerDialog'
import { mediaService } from '@/services/media.service'
import { ApiError, API_URL } from '@/lib/api-client'
import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = ['image/png', 'image/webp', 'image/jpeg', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024;

function mediaUrl(url: string): string {
  return url.startsWith('http') ? url : `${API_URL}${url}`
}

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

// Drag-and-drop image field, reused across every content form with an image
// (Services, Clients, Team, Portfolio, Testimonials…). Value is just the
// resulting URL — trivially controllable from plain useState, same as every
// other field in these forms. Upload-new-file OR pick-from-library, both
// wired to the same `value`.
export function ImageUploadField({ value, onChange, label = 'Image' }: ImageUploadFieldProps) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const upload = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Format non supporté (PNG, WEBP, JPEG ou SVG uniquement).')
      return
    }
    if (file.size > MAX_SIZE) {
      toast.error('Fichier trop volumineux (5 Mo maximum).')
      return
    }
    setUploading(true)
    try {
      const media = await mediaService.upload(file)
      onChange(mediaUrl(media.url))
      queryClient.invalidateQueries({ queryKey: ['media'] })
      queryClient.invalidateQueries({ queryKey: ['media', 'usage'] })
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Échec de l'envoi.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">{label}</label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-32 w-32 rounded-md border object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute -top-2 -right-2"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-input',
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files?.[0]
            if (file) void upload(file)
          }}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <ImageUp className="h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-xs text-muted-foreground">
            Glissez-déposez une image, ou cliquez pour choisir un fichier
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void upload(file)
              e.target.value = ''
            }}
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          placeholder="ou collez une URL directement"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          <FolderOpen className="h-4 w-4 mr-1" />
          Médiathèque
        </Button>
      </div>

      <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={onChange} />
    </div>
  )
}
