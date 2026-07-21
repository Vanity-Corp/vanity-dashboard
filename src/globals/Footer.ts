import type { GlobalConfig } from 'payload'

import { allowPublicRead, isAuthenticated } from '../access'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: allowPublicRead,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      fields: [
        { name: 'title', type: 'text' },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'link', type: 'text' },
          ],
        },
      ],
    },
  ],
}
