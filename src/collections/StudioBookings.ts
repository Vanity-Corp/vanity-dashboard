import type { CollectionConfig } from 'payload'

export const StudioBookings: CollectionConfig = {
  slug: 'studio-bookings',
  labels: {
    singular: 'Réservation',
    plural: 'Réservations',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'date', 'status', 'createdAt'],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nom', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'phone', type: 'text', label: 'Téléphone' },
    { name: 'date', type: 'date', label: 'Date', required: true },
    { name: 'notes', type: 'textarea', label: 'Notes' },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      options: [
        { label: 'En attente', value: 'pending' },
        { label: 'Confirmée', value: 'confirmed' },
        { label: 'Annulée', value: 'cancelled' },
      ],
      defaultValue: 'pending',
    },
  ],
}
