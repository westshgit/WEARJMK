import { CollectionConfig } from 'payload'

export const Currency: CollectionConfig = {
  admin: {
    group: 'Ecommerce',
  },
  slug: 'currency',
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
    },
    {
      name: 'symbol',
      type: 'text',
      required: true,
    },
    {
      name: 'exchangeRateToNGN',
      type: 'number',
      required: true,
    },
    {
      name: 'decimalPlaces',
      type: 'number',
      required: true,
      defaultValue: 2,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
