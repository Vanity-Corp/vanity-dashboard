import type { Block } from 'payload'

export const PricingBlock: Block = {
  slug: 'pricing',
  fields: [
    {
      name: 'packages',
      type: 'relationship',
      relationTo: 'pricing-packages',
      hasMany: true,
    },
  ],
}
