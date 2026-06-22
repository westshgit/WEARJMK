import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { link } from '@/fields/link'

export const QuickLinks: CollectionConfig = {
  admin: {
    group: 'Content',
  },
  slug: 'quick-links',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'header',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 10,
    },
  ],
}
