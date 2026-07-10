import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { Carousel } from '@/blocks/Carousel/config'
import { link } from '@/fields/link'
import { defaultCountries } from '@/lib/defaultCountries'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      type: 'array',
      name: 'navItems',
      label: 'Navigation Items',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'items',
          type: 'array',
          fields: [
            link({
              appearances: false,
            }),
          ],
          maxRows: 6,
          label: "Navigation Link's",
        },
      ],
      maxRows: 7,
    },
    {
      name: 'discount',
      type: 'group',
      fields: [
        {
          name: 'layout',
          type: 'blocks',
          blocks: [Carousel],
          required: true,
          label: 'Layout',
          maxRows: 1,
        },
      ],
    },
    {
      name: 'locations',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'address',
          type: 'group',
          fields: [
            { name: 'address1', type: 'text', required: true },
            { name: 'address2', type: 'text' },
            { name: 'city', type: 'text', required: true },
            { name: 'state', type: 'text' },
            { name: 'postalCode', type: 'text' },
            { name: 'country', type: 'select', options: defaultCountries, required: true },
            { name: 'phoneNumbers', type: 'array', fields: [{ name: 'phoneNumber', type: 'text', required: true }], required: true },
          ],
        },
        {
          name: 'hours',
          type: 'array',
          fields: [
            {
              name: 'day',
              type: 'select',
              options: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
              required: true,
            },
            {
              name: 'open',
              type: 'text', // or date if you prefer
            },
            {
              name: 'close',
              type: 'text',
            },
            {
              name: 'closed',
              type: 'checkbox',
            },
          ],
        },
      ],
    },
  ],
}
