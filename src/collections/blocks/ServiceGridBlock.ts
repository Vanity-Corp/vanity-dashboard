import type { Block } from 'payload'

export const ServiceGridBlock: Block = {
  slug: 'services',
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
    },
  ],
}
