import type { Block } from 'payload'

export const CTABlock: Block = {
  slug: 'cta',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'buttonLabel', type: 'text' },
    { name: 'buttonLink', type: 'text' },
  ],
}
