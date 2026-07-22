import type { CollectionConfig } from 'payload'

import { allowPublicRead, isAuthenticated } from '../access'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

/**
 * Client / brand / artist references shown across the marketing site
 * (BrandSlider, ClientSection, and the "Clients accompagnés" strategic grid).
 * Replaces the hardcoded arrays in the corp-site and the dormant Prisma
 * `ClientReference` model. Publicly readable for the headless frontend.
 */
export const Clients: CollectionConfig = {
  slug: 'clients',
  labels: { singular: 'Client', plural: 'Clients' },
  defaultSort: 'sortOrder',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'active', 'sortOrder'],
    group: 'Contenu',
  },
  access: {
    read: allowPublicRead,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  hooks: {
    afterChange: [revalidateCollection('clients')],
    afterDelete: [revalidateCollectionDelete('clients')],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nom', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo' },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Image (URL ou chemin)',
      admin: {
        description:
          "Utilisé si aucun logo n'est téléversé (ex: chemin d'un asset du site). Le logo téléversé a priorité.",
      },
    },
    { name: 'link', type: 'text', label: 'Lien (site / réseau social)' },
    { name: 'sector', type: 'text', label: 'Secteur' },
    { name: 'focus', type: 'text', label: 'Spécialité' },
    {
      name: 'category',
      type: 'select',
      label: 'Catégorie',
      required: true,
      defaultValue: 'brand',
      options: [
        { label: 'Marque', value: 'brand' },
        { label: 'Artiste', value: 'artist' },
        { label: 'Client stratégique', value: 'strategic_client' },
      ],
    },
    { name: 'active', type: 'checkbox', label: 'Actif', defaultValue: true },
    { name: 'sortOrder', type: 'number', label: 'Ordre', defaultValue: 0 },
  ],
}
