import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { fetchCurrencies } from '@/lib/api/currency.api'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import { ReactNode } from 'react'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const _currencies = await fetchCurrencies()
  const [currency, syncCurrency] = _currencies || [[], []]
  if (!currency || !syncCurrency) {
    throw new Error('Failed to fetch currencies')
  }
  const defaultCurrency = syncCurrency.find((item) => item.isDefault)

  return (
    <EcommerceProvider
      enableVariants={true}

      currenciesConfig={{
        supportedCurrencies: [...currency],
        defaultCurrency: defaultCurrency?.code || 'NGN',
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
      {' '}
      <AdminBar />
      <LivePreviewListener />
      <Header />
      <main>{children}</main>
      <Footer />
    </EcommerceProvider>
  )
}
