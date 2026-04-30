import type { CollectionConfig } from 'payload'

export const QuoteRequests: CollectionConfig = {
  slug: 'quote-requests',
  labels: {
    singular: 'Devis',
    plural: 'Devis',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'status', 'createdAt'],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nom' },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'phone', type: 'text', label: 'Téléphone' },
    { name: 'projectType', type: 'text', label: 'Type de projet' },
    { name: 'budget', type: 'text', label: 'Budget' },
    { name: 'message', type: 'textarea', label: 'Message' },
    { name: 'features', type: 'array', label: 'Fonctionnalités', fields: [{ name: 'value', type: 'text', label: 'Valeur' }] },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      options: [
        { label: 'Nouveau', value: 'new' },
        { label: 'Envoyé', value: 'sent' },
        { label: 'Échec', value: 'failed' },
      ],
      defaultValue: 'new',
    },
  ],
}
