import type { Block } from 'payload'

export const ProcessBlock: Block = {
  slug: 'process',
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'steps',
      type: 'array',
      fields: [
        { name: 'step', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}
