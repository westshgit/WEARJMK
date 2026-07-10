import { linkGroup } from '@/fields/linkGroup'
import { Block } from 'payload'

export const TwoSideWithContent: Block = {
  slug: 'twoSideWithContent',
  interfaceName: 'TwoSideWithContent',
  fields: [
    {
      name: 'twoSideTitle',
      type: 'text',
      required: true,
      label: 'Two Side Title',
    },
    {
      name: 'twoSideDescription',
      type: 'text',
      required: true,
      label: 'Two Side Description',
    },
    
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        {
          label: 'Collection',
          value: 'collection',
        },
        {
          label: 'Individual Selection',
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'products',
      label: 'Collections To Show',
      options: [
        {
          label: 'Products',
          value: 'products',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Categories To Show',
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: 'Limit',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: 'Selection',
      relationTo: ['products'],
    },
    {
      name: 'populatedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        description: 'This field is auto-populated after-read',
        disabled: true,
      },
      hasMany: true,
      label: 'Populated Docs',
      relationTo: ['products'],
    },
    {
      name: 'populatedDocsTotal',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        description: 'This field is auto-populated after-read',
        disabled: true,
        step: 1,
      },
      label: 'Populated Docs Total',
    },
  ],
}
