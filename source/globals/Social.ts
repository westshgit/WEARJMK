import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { link } from '@/fields/link'

export const Social: GlobalConfig = {
  slug: 'social',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      label: 'Social Links',
    },
  ],
}
