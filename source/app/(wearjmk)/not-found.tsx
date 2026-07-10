import Link from 'next/link'

import BrandImage from '@/components/BrandImage'
import HelpfulLinks from '@/components/HelpfulLinks'
import { Support } from '@/components/Support'
import { Button } from '@/components/ui/button'
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '@/lib/client.env'
import { ThemeModeSelector } from '@/providers'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Not Found WearJMK',
    description: "We couldn't find the page you were looking for.",
  }
}

export default function NotFound() {
  return (
    <div className="flex flex-col p-6 gap-16 min-h-screen">
      <div>{<BrandImage />}</div>

      <div className="flex-1 md:flex md:items-center w-full md:flex-col md:justify-center">
        <h1 className="text-7xl md:text-9xl font-bold text-accent-foreground mb-4">404</h1>
        <p className="text-xl md:text-2xl font-semibold text-foreground mb-2">Page Not Found</p>
        <p className="text-base text-muted-foreground text-start md:text-center max-w-md mb-8">
          We couldn't find the page you were looking for. It may have been moved or deleted.
        </p>

        <div className="flex gap-4 mb-12">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
          <ThemeModeSelector />
          <Support email={SUPPORT_EMAIL} whatsapp={SUPPORT_WHATSAPP} mode="error" />
        </div>
      </div>
    </div>
  )
}
