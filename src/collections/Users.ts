import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
        { label: 'Crea', value: 'crea' },
        { label: 'Sales', value: 'sales' },
      ],
      defaultValue: 'crea',
      saveToJWT: true,
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'textarea' },
  ],
}
