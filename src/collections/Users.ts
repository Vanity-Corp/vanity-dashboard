import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel, isAdminOrSelf } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    // First user is always creatable via the admin bootstrap; afterwards only admins add staff.
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
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
      // Prevent privilege escalation: only admins may change roles.
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'textarea' },
  ],
}
