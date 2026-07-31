import { AdminBar } from '@/components/AdminBar'
import { EcommerceProvider } from '@/providers/EcommerceProvider'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PageTransition } from '@/components/layout/PageTransition'
import { ReactNode, Suspense } from 'react'

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <EcommerceProvider>
      <Suspense>
        <AdminBar />
      </Suspense>
      <LivePreviewListener />
      <Suspense>
        <Header />
      </Suspense>
      <Suspense>
        <PageTransition>{children}</PageTransition>
      </Suspense>
      <Footer />
    </EcommerceProvider>
  )
}
