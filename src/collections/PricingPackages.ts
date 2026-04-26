import type { CollectionConfig } from 'payload'

export const PricingPackages: CollectionConfig = {
  slug: 'pricing-packages',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'price', type: 'text' },
    {
      name: 'features',
      type: 'array',
      fields: [{ name: 'feature', type: 'text' }],
    },
    { name: 'highlighted', type: 'checkbox' },
  ],
}
