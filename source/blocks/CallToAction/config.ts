import type { Block } from 'payload'
import { linkGroup } from '@/fields/linkGroup'

export const CallToActionBlock: Block = {
  slug: 'cta',
  interfaceName: 'CallToActionBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'subheading',
      type: 'text',
      required: true,
    },
    {
      name: 'whatsapp',
      label: 'WhatsApp CTA',
      type: 'group',
      fields: [
        linkGroup({
          overrides: {
            maxRows: 1,
          },
        }),
      ],
      required: false,
    },
    {
      name: 'email',
      label: 'Email CTA',
      type: 'group',
      fields: [
        {
          name: 'emailHeading',
          label: 'Email Heading',
          type: 'text',
          required: true,
        },
        {
          name: 'emailSubheading',
          label: 'Email Subheading',
          type: 'text',
          required: true,
        },
      ],
      required: false,
    },
  ],
  labels: {
    plural: 'Calls to Action',
    singular: 'Call to Action',
  },
}
