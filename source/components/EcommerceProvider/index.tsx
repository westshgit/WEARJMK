'use client'

import { paystackAdapterClient } from '@/lib/api/payment/paystack/clientAdapter'
import { EcommerceProvider as PayloadEcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
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
        paystackAdapterClient({
          label: 'Paystack',
        }),
      ]}
    >
      {children}
    </PayloadEcommerceProvider>
  )
}
