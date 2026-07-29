import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { link } from '@/fields/link'
import { revalidateGlobal } from '@/utilities/globalCache'
import { getDisableRevalidate } from '@/utilities/genericCollectionHook'

export const Social: GlobalConfig = {
  slug: 'social',
  access: {
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        if (!getDisableRevalidate({ req })) revalidateGlobal('social')
        return doc
      },
    ],
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
