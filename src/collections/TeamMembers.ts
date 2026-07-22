import type { CollectionConfig } from 'payload'

import { allowPublicRead, isAuthenticated } from '../access'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: { singular: 'Vaniteam', plural: 'Vaniteam' },
  defaultSort: 'sortOrder',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'sortOrder'],
    group: 'Contenu',
  },
  access: {
    read: allowPublicRead,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  hooks: {
    afterChange: [revalidateCollection('team-members')],
    afterDelete: [revalidateCollectionDelete('team-members')],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nom', required: true },
    { name: 'position', type: 'text', label: 'Rôle' },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Photo (téléversée)' },
    { name: 'imageUrl', type: 'text', label: 'Photo (URL ou chemin)' },
    { name: 'bio', type: 'textarea', label: 'Bio' },
    { name: 'sortOrder', type: 'number', label: 'Ordre', defaultValue: 0 },
  ],
}
