import type { Block } from 'payload'

export const FAQBlock: Block = {
  slug: 'faq',
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'question', type: 'text' },
        { name: 'answer', type: 'textarea' },
      ],
    },
  ],
}
