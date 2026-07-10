import type { ReactNode } from 'react'

import MessageRenderer from '@/components/MessageRenderer'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SonnerProvider } from '@/providers'
import { AuthProvider } from '@/providers/Auth'
import { ThemeProvider } from '@wrksz/themes/next'
import { Merriweather, Roboto } from 'next/font/google'
import './globals.css'

/* const { SITE_NAME, TWITTER_CREATOR, TWITTER_SITE } = process.env
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000'
const twitterCreator = TWITTER_CREATOR ? ensureStartsWith(TWITTER_CREATOR, '@') : undefined
const twitterSite = TWITTER_SITE ? ensureStartsWith(TWITTER_SITE, 'https://') : undefined
 */
/* export const metadata = {
  metadataBase: new URL(baseUrl),
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  ...(twitterCreator &&
    twitterSite && {
      twitter: {
        card: 'summary_large_image',
        creator: twitterCreator,
        site: twitterSite,
      },
    }),
} */

const fontSans = Roboto({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['100', '300', '400', '500', '700', '900'],
})

const fontMono = Merriweather({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '700', '900'],
})

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={[fontSans.variable, fontMono.variable].filter(Boolean).join(' ')} lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/media/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/media/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/media/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/media/favicon/site.webmanifest" />
      </head>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MessageRenderer />
          <AuthProvider>
            <SonnerProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </SonnerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
