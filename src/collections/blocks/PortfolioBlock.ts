import type { Block } from 'payload'

export const PortfolioBlock: Block = {
  slug: 'portfolio',
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
    },
  ],
}
