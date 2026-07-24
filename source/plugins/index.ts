import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Field, Plugin } from 'payload'

import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { ProductsCollection } from '@/collections/Products'
import { defaultCountries } from '@/lib/defaultCountries'
import type { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { paystackAdapter } from '@/lib/api/payment/paystack/paystackAdapter'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | WearJMK Website` : 'WearJMK Website'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
      },
      admin: {
        group: 'Content',
      },
    },
    formOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
        create: isAdmin,
      },
      admin: {
        group: 'Content',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [...rootFeatures, FixedToolbarFeature(), HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] })]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    currencies: {
      supportedCurrencies: [{ code: 'NGN', decimals: 2, label: 'Naira', symbol: '₦' }],
      defaultCurrency: 'NGN',
    },
    customers: {
      slug: 'users',
    },
    addresses: {
      addressFields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'country') {
            return {
              name: 'country',
              type: 'select',
              options: defaultCountries,
              defaultValue: 'NG',
            } as Field
          }

          return field
        })
      },
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: [
          ...defaultCollection.fields,
          {
            name: 'accessToken',
            type: 'text',
            unique: true,
            index: true,
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
            hooks: {
              beforeValidate: [
                ({ value, operation }) => {
                  if (operation === 'create' || !value) {
                    return crypto.randomUUID()
                  }
                  return value
                },
              ],
            },
          },
        ],
      }),
    },
    carts: {
      cartsCollectionOverride: ({ defaultCollection }) => {
        return {
          ...defaultCollection,
        }
      },
    },
    payments: {
      paymentMethods: [paystackAdapter],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
    },
  }),
]
