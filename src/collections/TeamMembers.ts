import type { CollectionConfig } from 'payload'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: { singular: 'Vaniteam', plural: 'Vaniteam' },
  fields: [
    { name: 'name', type: 'text', label: 'Nom', required: true },
    { name: 'position', type: 'text', label: 'Rôle' },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Photo' },
    { name: 'bio', type: 'textarea', label: 'Bio' },
  ],
}
