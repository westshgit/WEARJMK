import type { Metadata } from 'next'

import Link from 'next/link'

import { BrandWordmark } from '@/components/Header/BrandWordmark'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RiArrowRightSLine, RiFileListLine, RiLink } from '@remixicon/react'

const siteName = process.env.SITE_NAME ?? 'Wear JMK'
const siteUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000'

const pageTitle = 'Wear JMK Bio'
const pageDescription =
  'Wear JMK bio page for Instagram and social traffic. Shop ready-to-wear collections, start a custom order, and access the core brand experience from one mobile-first hub.'

// const highlights = ['Adire accessories', 'Ankara streetwear', 'Boubou designs', 'Ready-to-wear collections', 'Custom tailoring', 'Fast order support']

// const quickLinks = [
//   {
//     description: 'Browse new drops, best sellers, and the full collection.',
//     href: '/shop',
//     title: 'Shop the latest',
//   },
//   {
//     description: 'Start a custom piece and send your fit or style notes.',
//     href: '#custom',
//     title: 'Start custom order',
//   },
//   {
//     description: 'Check the status of an order without digging through DMs.',
//     href: '/find-order',
//     title: 'Find order',
//   },
//   {
//     description: 'See what Wear JMK is about before you buy.',
//     href: '#about',
//     title: 'What to expect',
//   },
// ]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  description: pageDescription,
  inLanguage: 'en',
  isPartOf: {
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  },
  name: pageTitle,
  url: `${siteUrl}/bio`,
}

export const metadata: Metadata = {
  alternates: {
    canonical: '/bio',
  },
  description: pageDescription,
  keywords: ['Wear JMK', 'bio page', 'Instagram bio', 'social landing page', 'custom tailoring', 'ready-to-wear fashion', 'Ankara', 'Adire'],
  openGraph: {
    description: pageDescription,
    images: [
      {
        alt: 'Wear JMK bio landing page',
        height: 630,
        url: '/media/images/background-image-001.webp',
        width: 1200,
      },
    ],
    siteName,
    title: pageTitle,
    type: 'website',
    url: '/bio',
  },
  robots: {
    follow: true,
    index: true,
  },
  title: pageTitle,
  twitter: {
    card: 'summary_large_image',
    description: pageDescription,
    images: ['/media/images/background-image-001.webp'],
    title: pageTitle,
  },
}

export default function BioPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-primary/15 via-background to-background px-4 py-8 sm:px-6 lg:px-8">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
        type="application/ld+json"
      />

      <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-2xl backdrop-blur">
          <div className="space-y-6 px-5 py-8 sm:px-8">
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <BrandWordmark />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight text-balance sm:text-4xl">Page Under Development</h1>
                <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                  This page is under active development. Check back in a few days!
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

// <ul className="flex flex-wrap justify-center gap-2">
//   {highlights.map((item) => (
//     <li key={item}>
//       <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
//         {item}
//       </Badge>
//     </li>
//   ))}
// </ul>

// <div className="space-y-3">
//   {quickLinks.map((item) => (
//     <Button
//       asChild
//       key={item.title}
//       variant="ghost"
//       className="h-auto w-full justify-between rounded-3xl border border-border/60 px-4 py-4 text-left"
//     >
//       <Link href={item.href}>
//         <span className="flex flex-col items-start gap-1">
//           <span className="font-medium">{item.title}</span>
//           <span className="text-sm text-muted-foreground">{item.description}</span>
//         </span>
//         <RiArrowRightSLine className="size-5" />
//       </Link>
//     </Button>
//   ))}
// </div>

// <Card id="custom" className="border-border/70 bg-muted/30 shadow-none">
//   <CardHeader>
//     <CardTitle>How it works</CardTitle>
//     <CardDescription>Fast, direct, and built for mobile.</CardDescription>
//   </CardHeader>
//   <CardContent className="space-y-3">
//     {experienceSteps.map((step, index) => (
//       <div key={step} className="flex items-start gap-3">
//         <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
//           {index + 1}
//         </div>
//         <p className="text-sm leading-6 text-muted-foreground">{step}</p>
//       </div>
//     ))}
//   </CardContent>
// </Card>
