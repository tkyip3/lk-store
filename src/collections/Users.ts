import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    { name: 'name1', type: 'number' },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      required: true,
    },
    // Add more fields as needed
  ],
}
