import { AdminBar } from '@/components/AdminBar'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { ReactNode } from 'react'
import { AuthProvider } from '@/providers/Auth'
import { HeaderThemeProvider } from '@/providers/HeaderTheme'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <HeaderThemeProvider>
        <EcommerceProvider
          enableVariants={true}
          currenciesConfig={{
            supportedCurrencies: [
              {
                code: 'USD',
                symbol: '$',
                label: 'United States Dollar',
                decimals: 2,
                symbolDisplay: 'symbol',
              },
              {
                code: 'GBP',
                symbol: '£',
                label: 'British Pound',
                decimals: 2,
                symbolDisplay: 'symbol',
              },
              { code: 'EUR', symbol: '€', label: 'Euro', decimals: 2, symbolDisplay: 'symbol' },
              {
                code: 'NGN',
                symbol: '₦',
                label: 'Nigerian Naira',
                decimals: 2,
                symbolDisplay: 'symbol',
              },
            ],
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
          <main className="container mb-24 p-4">{children}</main>
          <Footer />
        </EcommerceProvider>
      </HeaderThemeProvider>
    </AuthProvider>
  )
}
