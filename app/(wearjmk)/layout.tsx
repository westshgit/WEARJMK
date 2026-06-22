import type { ReactNode } from 'react'

import { InitTheme } from '@/providers/Theme/InitTheme'
import { Oxanium } from 'next/font/google'

import '../globals.css'
import { ThemeProvider } from '@/providers/Theme'
import { SonnerProvider } from '@/providers/Sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

const oxanium = Oxanium({ subsets: ['latin'], variable: '--font-mono' })
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000'
const { SITE_NAME } = process.env

export const metadata = {
  metadataBase: new URL(baseUrl),
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  /* ...(twitterCreator &&
    twitterSite && {
      twitter: {
        card: 'summary_large_image',
        creator: twitterCreator,
        site: twitterSite,
      },
    }),
    */
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className={[oxanium.variable, 'antialiased', 'font-mono!', 'relative', '*:font-mono!', 'bg-background'].filter(Boolean).join(' ')}>
        <ThemeProvider>
          <SonnerProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </SonnerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

/* 

const twitterCreator = TWITTER_CREATOR ? ensureStartsWith(TWITTER_CREATOR, '@') : undefined
const twitterSite = TWITTER_SITE ? ensureStartsWith(TWITTER_SITE, 'https://') : undefined
 */
/*  */
//
