import type { Metadata } from 'next'
import { BrandWordmark } from '@/components/Header/BrandWordmark'
import { Badge } from '@/components/ui/badge'
import { RiFacebookFill, RiInstagramLine, RiLink, RiSearch2Line, RiShoppingBag2Line, RiTiktokLine } from '@remixicon/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Fragment, JSX, ReactNode } from 'react'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const siteName = process.env.SITE_NAME ?? 'Wear JMK'
const siteUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000'

const pageTitle = 'Wear JMK Bio'
const pageDescription =
  'Wear JMK bio page for Instagram and social traffic. Shop ready-to-wear collections, start a custom order, and access the core brand experience from one mobile-first hub.'

const knownSocialIcon = {
  instagram: (
    <span className="text-red-600">
      <RiInstagramLine />
    </span>
  ),
  facebook: (
    <span className="text-blue-600">
      <RiFacebookFill />
    </span>
  ),
  tiktok: (
    <span className="text-black dark:text-white">
      <RiTiktokLine />
    </span>
  ),
  wearjmk: (
    <span>
      <BrandWordmark />
    </span>
  ),
}

const quickLinks: BioQuickLink[] = [
  {
    description: 'Visit the WearJMK online shop to browse our ready-to-wear collections and accessories.',
    href: 'https://wearjmk.com/shop',
    label: 'WearJMK',
  },
  {
    description: 'Follow us on Instagram',
    href: 'https://www.instagram.com/wearjmk/',
    label: 'Instagram',
  },

  {
    description: 'Follow us on Facebook',
    href: 'https://www.facebook.com/wearjmk/',
    label: 'Facebook',
  },

  {
    description: 'Follow us on TikTok',
    href: 'https://www.tiktok.com/@wearjmk',
    label: 'TikTok',
  },
  {
    description: 'Shop our latest Ankara and Adire collections',
    href: 'https://wearjmk.com/shop?category=collections',
    label: 'Collections',
  },
  {
    description: 'Start a custom tailoring order today',
    href: 'https://wearjmk.com/custom-order',
    label: 'Custom Orders',
  },
  {
    description: 'Browse our curated seasonal lookbook',
    href: 'https://wearjmk.com/lookbook',
    label: 'Lookbook',
  },
  {
    description: 'Get style tips and fashion inspiration',
    href: 'https://wearjmk.com/blog',
    label: 'Blog',
  },
]

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/bio',
  },
  category: 'fashion',
  description: pageDescription,
  keywords: [
    'Wear JMK',
    'WearJMK',
    'bio page',
    'Instagram bio',
    'social landing page',
    'custom tailoring',
    'ready-to-wear fashion',
    'Ankara',
    'Adire',
    'Boubou designs',
    'lookbook',
    'Nigerian fashion brand',
  ],
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
    locale: 'en_GB',
    siteName,
    title: pageTitle,
    type: 'website',
    url: '/bio',
  },
  publisher: siteName,
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
    index: true,
  },
  title: pageTitle,
  twitter: {
    creator: '@wearjmk',
    card: 'summary_large_image',
    description: pageDescription,
    images: ['/media/images/background-image-001.webp'],
    title: pageTitle,
  },
}

interface BioQuickLink {
  description: string
  href: string
  label: string
}

export default function BioPage() {
  const bioDescription =
    'When in doubt, wear JMK. Use our quick links to navigate the brand experience and express shopping to quickly view what we have in store for you.'

  const keyNotes = ['Adire accessories', 'Ankara streetwear', 'Boubou designs', 'Ready-to-wear collections', 'Custom tailoring', 'Fast order support']
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    description: pageDescription,
    name: pageTitle,
    url: `${siteUrl}/bio`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: quickLinks.map((link, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'WebPage',
          description: link.description,
          name: link.label,
          url: link.href,
        },
      })),
    },
  }

  return (
    <div className="max-w-md mx-auto space-y-9">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="space-y-9 p-8 rounded-xl">
        <div className="flex mt-6 items-center flex-col gap-4 justify-center">
          <h1 className="sr-only">{pageTitle}</h1>
          <BrandWordmark />
          <p className="text-sm text-muted-foreground max-w-[70%] text-center mx-auto">{bioDescription}</p>
        </div>
        <div className="space-x-1">
          {keyNotes.map((note, index) => (
            <Badge key={index} variant="secondary">
              {note}
            </Badge>
          ))}
        </div>
        <Tabs className="w-full" defaultValue="quick-links">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick-links">
              <RiLink /> Links
            </TabsTrigger>
            <TabsTrigger value="express-shopping">
              <RiShoppingBag2Line />
              Shop
            </TabsTrigger>
          </TabsList>
          <TabsContent value="quick-links">
            <ItemGroup className="my-4 space-y-3">
              {quickLinks.map(({ href, label, description }, index) => {
                const Icon: ReactNode | JSX.Element | null = knownSocialIcon[label.toLowerCase() as keyof typeof knownSocialIcon] ?? null
                return (
                  <Link key={index} href={href} target="_blank" rel="noopener noreferrer">
                    <Item variant={'outline'} size="xs" className="shadow-sm">
                      <ItemContent>
                        <ItemTitle className="flex items-center gap-2">
                          {Icon && <Fragment>{Icon}</Fragment>}
                          <span className="font-bold">{label}</span>
                        </ItemTitle>
                        <ItemDescription className="text-xs">{description}</ItemDescription>
                      </ItemContent>
                    </Item>
                  </Link>
                )
              })}
            </ItemGroup>
          </TabsContent>
          <TabsContent value="express-shopping" className="mt-2 space-y-6">
            <div className="relative flex items-center">
              <RiSearch2Line className="absolute left-3 size-6 text-muted-foreground pointer-events-none" />
              <Input className="h-14 text-base md:text-xl pl-12 pr-4 placeholder:text-sm" placeholder="Search products..." />
            </div>
            {Array.from({ length: 6 }).map((_, index) => {
              return (
                <div className="p-2 space-y-3" key={index}>
                  <div>
                    <h2 className="text-xl font-medium">Women's Wear</h2>
                  </div>
                  <Card>
                    <CardContent className="h-60"></CardContent>
                  </Card>
                </div>
              )
            })}
          </TabsContent>
        </Tabs>
      </div>
      <div className="space-y-6 p-4">
        <BrandWordmark />
        <div className="flex items-center justify-end">
          <ThemeSelector />
        </div>
      </div>
    </div>
  )
}
