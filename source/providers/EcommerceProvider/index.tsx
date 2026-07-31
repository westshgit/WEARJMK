'use client'

import { EcommerceProvider as PayloadEcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import type { ReactNode } from 'react'

export function EcommerceProvider({ children }: { children: ReactNode }) {
  return (
    <PayloadEcommerceProvider
      enableVariants={true}
      currenciesConfig={{
        supportedCurrencies: [{ code: 'NGN', decimals: 2, label: 'Naira', symbol: '\u20a6' }],
        defaultCurrency: 'NGN',
      }}
      api={{
        cartsFetchQuery: {
          depth: 2,
          populate: {
            products: {
              slug: true,
              title: true,
              gallery: true,
              inventory: true,
            },
            variants: {
              title: true,
              inventory: true,
            },
          },
        },
      }}
      paymentMethods={[
        stripeAdapterClient({
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        }),
      ]}
    >
      {children}
    </PayloadEcommerceProvider>
  )
}
