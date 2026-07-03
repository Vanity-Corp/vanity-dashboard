import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'slug', type: 'text', unique: true },
    { name: 'client', type: 'text' },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    {
      name: 'gallery',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
    },
    { name: 'description', type: 'richText' },
  ],
}
