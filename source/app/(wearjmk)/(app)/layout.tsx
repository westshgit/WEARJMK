import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import { ReactNode } from 'react'

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <EcommerceProvider
      enableVariants={true}

      currenciesConfig={{
        supportedCurrencies: [{ code: 'NGN', decimals: 2, label: 'Naira', symbol: '₦' }],
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
      <AdminBar />
      <LivePreviewListener />
      <Header />
      <main>{children}</main>
      <Footer />
    </EcommerceProvider>
  )
}
