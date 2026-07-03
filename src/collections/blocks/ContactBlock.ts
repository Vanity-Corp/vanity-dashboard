import type { Block } from 'payload'

export const ContactBlock: Block = {
  slug: 'contact',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'address', type: 'text' },
  ],
}
