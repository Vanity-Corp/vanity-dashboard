import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: {
    singular: 'Email',
    plural: 'Emails',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'type', 'status', 'createdAt'],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nom' },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'phone', type: 'text', label: 'Téléphone' },
    { name: 'message', type: 'textarea', label: 'Message' },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Devis', value: 'quote' },
      ],
      defaultValue: 'contact',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      options: [
        { label: 'Nouveau', value: 'new' },
        { label: 'Envoyé', value: 'sent' },
        { label: 'Échec', value: 'failed' },
        { label: 'En cours', value: 'in-progress' },
        { label: 'Clos', value: 'closed' },
      ],
      defaultValue: 'new',
    },
  ],
}
