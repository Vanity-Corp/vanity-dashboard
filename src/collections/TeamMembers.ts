import type { CollectionConfig } from 'payload'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'position', type: 'text' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea' },
  ],
}
