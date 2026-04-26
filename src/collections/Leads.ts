import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'message', type: 'textarea' },
    {
      name: 'type',
      type: 'select',
      options: ['contact', 'quote'],
    },
    {
      name: 'status',
      type: 'select',
      options: ['new', 'in-progress', 'closed'],
      defaultValue: 'new',
    },
  ],
}
