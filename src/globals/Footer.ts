import type { GlobalConfig } from 'payload'

import { allowPublicRead, isAuthenticated } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: allowPublicRead,
    update: isAuthenticated,
  },
  hooks: {
    afterChange: [revalidateGlobal('footer')],
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
