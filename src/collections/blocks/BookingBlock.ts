import type { Block } from 'payload'

export const BookingBlock: Block = {
  slug: 'booking',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' },
  ],
}
