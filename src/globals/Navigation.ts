import type { GlobalConfig } from 'payload'

import { allowPublicRead, isAuthenticated } from '../access'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: allowPublicRead,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Éléments de navigation',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'link', type: 'text' },
        { name: 'description', type: 'text', label: 'Description (méga-menu)' },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Image (méga-menu)' },
        {
          name: 'disabled',
          type: 'checkbox',
          label: 'Désactivé ("En cours de création")',
          defaultValue: false,
        },
        {
          name: 'children',
          type: 'array',
          label: 'Sous-éléments',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'link', type: 'text' },
            { name: 'description', type: 'text' },
            { name: 'image', type: 'upload', relationTo: 'media' },
            { name: 'disabled', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
  ],
}
