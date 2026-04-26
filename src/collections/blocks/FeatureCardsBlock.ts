import type { Block } from 'payload'

export const FeatureCardsBlock: Block = {
  slug: 'features',
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'icon', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
