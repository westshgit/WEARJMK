'use client'

import BrandImage from '@/components/BrandImage'
import HelpfulLinks from '@/components/HelpfulLinks'
import { Support } from '@/components/Support'
import { Button } from '@/components/ui/button'
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '@/lib/client.env'
import { ThemeModeSelector } from '@/providers'
import { RefreshCcwIcon } from 'lucide-react'

export default function Error({ reset }: { reset: () => void }) {
  const links = [
    { href: '/', label: 'Go Home' },
    { href: '/shop', label: 'Browse Products' },
  ]

  return (
    <div className="flex flex-col p-6 gap-16 min-h-screen">
      <div>{<BrandImage />}</div>

      <div className="flex-1 md:flex md:items-center w-full md:flex-col md:justify-center">
        <h1 className="text-7xl md:text-9xl font-bold text-accent-foreground mb-4">Error</h1>
        <p className="text-xl md:text-2xl font-semibold text-foreground mb-2">Something Went Wrong</p>
        <p className="text-base text-muted-foreground text-start md:text-center max-w-md mb-8">
          There was an issue with our store. This could be a temporary issue, please try your action again.
        </p>

        <Button onClick={reset} className="mb-12">
          Try Again <RefreshCcwIcon />
        </Button>

        <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
          <HelpfulLinks links={links} />
          <ThemeModeSelector />
          <Support email={SUPPORT_EMAIL} whatsapp={SUPPORT_WHATSAPP} mode="error" />
        </div>
      </div>
    </div>
  )
}
