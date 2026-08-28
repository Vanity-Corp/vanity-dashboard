import type { CollectionConfig } from 'payload'

import { allowPublicRead, isAuthenticated } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  access: {
    read: allowPublicRead,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [{ name: 'alt', type: 'text' }],
}
