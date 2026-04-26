import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'video', type: 'upload', relationTo: 'media' },
    { name: 'poster', type: 'upload', relationTo: 'media' },
  ],
}
