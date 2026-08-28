import type { CollectionConfig } from 'payload'

import { allowPublicRead, isAuthenticated } from '../access'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
  defaultSort: 'sortOrder',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'sortOrder'],
    group: 'Contenu',
  },
  access: {
    read: allowPublicRead,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  hooks: {
    afterChange: [revalidateCollection('services')],
    afterDelete: [revalidateCollectionDelete('services')],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Titre', required: true },
    {
      name: 'slug',
      type: 'text',
      label: 'Identifiant',
      unique: true,
      required: true,
      admin: { description: 'Ex: studio-de-tournage, accompagnement-strategique, audiovisuel' },
    },
    { name: 'eyebrow', type: 'text', label: 'Sur-titre' },
    { name: 'color', type: 'text', label: 'Couleur (hex)' },
    { name: 'link', type: 'text', label: 'Lien' },
    { name: 'reverse', type: 'checkbox', label: 'Inverser la mise en page', defaultValue: false },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Image (téléversée)' },
    { name: 'imageUrl', type: 'text', label: 'Image (URL ou chemin)' },
    { name: 'sortOrder', type: 'number', label: 'Ordre', defaultValue: 0 },
    {
      name: 'features',
      type: 'array',
      label: 'Points forts',
      fields: [
        { name: 'name', type: 'text', label: 'Titre' },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'icon', type: 'text', label: 'Icône (nom Lucide)', admin: { description: 'Ex: Camera, Lightbulb, Target' } },
      ],
    },
  ],
}
