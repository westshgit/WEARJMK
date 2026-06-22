'use client'

import { BrandWordmark } from '@/components/Header/BrandWordmark'
import { Button } from '@/components/ui/button'
import { RiRefreshLine } from '@remixicon/react'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Error',
    description: 'There was an issue with our store. This could be a temporary issue, please try your action again.',
  }
}

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col p-6 gap-16 min-h-screen">
      <div>
        <BrandWordmark />
      </div>

      <div className="flex-1 flex items-center w-full flex-col justify-center">
        <h1 className="text-7xl md:text-9xl font-bold text-accent-foreground mb-4">Error</h1>
        <p className="text-xl md:text-2xl font-semibold text-foreground mb-2">Something Went Wrong</p>
        <p className="text-base text-muted-foreground text-center max-w-md mb-8">
          There was an issue with our store. This could be a temporary issue, please try your action again.
        </p>

        <Button onClick={() => reset()} className="mb-12">
          Try Again <RiRefreshLine />
        </Button>

        <div className="w-full max-w-md border-t pt-8">
          <p className="text-sm text-muted-foreground mb-4">Other helpful links:</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="text-primary hover:underline">
                Go Home
              </a>
            </li>
            <li>
              <a href="/shop" className="text-primary hover:underline">
                Browse Products
              </a>
            </li>
            <li>
              <a href="/contact" className="text-primary hover:underline">
                Contact Support
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
