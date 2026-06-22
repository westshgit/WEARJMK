import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { BrandWordmark } from '@/components/Header/BrandWordmark'
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
      <div>
        <BrandWordmark />
      </div>

      <div className="flex-1 flex items-center w-full flex-col justify-center">
        <h1 className="text-7xl md:text-9xl font-bold text-accent-foreground mb-4">404</h1>
        <p className="text-xl md:text-2xl font-semibold text-foreground mb-2">Page Not Found</p>
        <p className="text-base text-muted-foreground text-center max-w-md mb-8">
          We couldn't find the page you were looking for. It may have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>

        <div className="w-full max-w-md border-t pt-8">
          <p className="text-sm text-muted-foreground mb-4">Other helpful links:</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="text-primary hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-primary hover:underline">
                Contact Support
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-primary hover:underline">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
