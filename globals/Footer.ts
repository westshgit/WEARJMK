import { adminOnly } from '@/access/adminOnly'
import { Carousel } from '@/blocks/Carousel/config'
import { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  custom: {},
  slug: 'footer',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'address',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'address',
          type: 'text',
          required: true,
        },
        {
          name: 'time',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'developerName',
      type: 'text',
      required: true,
    },
    {
      name: 'developerEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'promoLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'promoDescription',
      type: 'text',
      required: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [Carousel],
      unique: true,
      required: true,
      label: 'Content',
    },
  ],
}
