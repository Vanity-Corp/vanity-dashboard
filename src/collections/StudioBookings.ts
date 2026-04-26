import type { CollectionConfig } from 'payload'

export const StudioBookings: CollectionConfig = {
  slug: 'studio-bookings',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    { name: 'date', type: 'date', required: true },
    { name: 'notes', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'confirmed', 'cancelled'],
      defaultValue: 'pending',
    },
  ],
}
