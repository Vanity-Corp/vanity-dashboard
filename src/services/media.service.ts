import { apiFetch, apiUpload } from '@/lib/api-client'
import type { Media, MediaUsage } from '@/types'

export const mediaService = {
  list: () => apiFetch<Media[]>('/admin/media'),
  usage: () => apiFetch<MediaUsage>('/admin/media/usage'),
  upload: (file: File, alt?: string) => {
    const form = new FormData()
    form.append('file', file)
    if (alt) form.append('alt', alt)
    return apiUpload<Media>('/admin/media', form)
  },
  remove: (id: string) => apiFetch<void>(`/admin/media/${id}`, { method: 'DELETE' }),
}
