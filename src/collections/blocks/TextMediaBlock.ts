import type { Block } from 'payload'

export const TextMediaBlock: Block = {
  slug: 'textMedia',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'content', type: 'richText' },
    { name: 'media', type: 'upload', relationTo: 'media' },
    { name: 'reversed', type: 'checkbox' },
  ],
}
