import type { Block } from 'payload'
export const HeroBlock: Block = {
  slug: 'hero',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },

    {
      name: 'primaryCTA',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'link', type: 'text' },
      ],
    },

    {
      name: 'secondaryCTA',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'link', type: 'text' },
      ],
    },

    { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
  ],
}
