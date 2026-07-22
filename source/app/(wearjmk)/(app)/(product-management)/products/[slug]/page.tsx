import type { Media, Product } from '@/payload-types'
import { Gallery } from '@/components/product/Gallery'
import { ProductDescription } from '@/components/product/ProductDescription'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon } from 'lucide-react'
import { Metadata } from 'next'
import { CarouselClient } from '@/blocks/Carousel/Component.client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Condition from '@/components/Condition'
import { queryProductBySlug } from '@/lib/api'
import ProductSheet from '@/components/product/ProductSheet'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery = product.gallery?.filter((item) => typeof item.image === 'object') || []
  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'

  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)

  return {
    description: product.meta?.description || '',
    openGraph: seoImage?.url
      ? {
          images: [
            {
              alt: seoImage?.alt,
              height: seoImage.height!,
              url: seoImage?.url,
              width: seoImage.width!,
            },
          ],
        }
      : null,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: product.meta?.title || product.title,
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery =
    product.gallery
      ?.filter((item) => typeof item.image === 'object')
      .map((item) => ({
        ...item,
        image: item.image as Media,
      })) || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const hasStock = product.enableVariants
    ? product?.variants?.docs?.some((variant) => {
        if (typeof variant !== 'object') return false
        return variant.inventory && variant?.inventory > 0
      })
    : product.inventory! > 0

  let price = product.priceInNGN

  if (product.enableVariants && product?.variants?.docs?.length) {
    price = product?.variants?.docs?.reduce((acc, variant) => {
      if (typeof variant === 'object' && variant?.priceInNGN && acc && variant?.priceInNGN > acc) {
        return variant.priceInNGN
      }
      return acc
    }, price)
  }

  const productJsonLd = {
    name: product.title,
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: product.productDescription,
    image: metaImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      price: price,
      priceCurrency: 'usd',
    },
  }

  const relatedProducts = product.relatedProducts?.filter((relatedProduct) => typeof relatedProduct === 'object') ?? []

  return (
    <React.Fragment>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="space-y-16 container mb-16">
        <div className="w-full pt-8 pb-8">
          <Button asChild variant="outline" className="mb-4 uppercase text-xs md:text-sm" size="sm">
            <Link href="/shop">
              <ChevronLeftIcon />
              All products
            </Link>
          </Button>
          <div className="p-1 bg-primary-foreground grid md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] gap-2 md:gap-8">
            <div className="size-full">
              <Suspense fallback={<div className="relative aspect-square h-full max-h-137.5 w-full overflow-hidden" />}>
                {Boolean(gallery?.length) && <Gallery gallery={gallery} />}
              </Suspense>
            </div>

            <div className="hidden md:block p-4 lg:p-8">
              <ProductDescription product={product} />
            </div>

            <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-background shadow-lg">
              <ProductSheet product={product} price={price ?? 0} />
            </div>
          </div>
        </div>

        <Condition predicate={Boolean(product.sizeCharts && product.sizeCharts.length > 0)}>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="size-chart" className="border-b border-border">
              <AccordionTrigger className="text-sm tracking-[0.2em] uppercase font-bold hover:no-underline py-3">Size Chart</AccordionTrigger>
              <AccordionContent>
                {product.sizeCharts && product.sizeCharts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>Bust</TableHead>
                        <TableHead>Waist</TableHead>
                        <TableHead>Hips</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.sizeCharts.map((row) => {
                        if (!row) return null
                        return (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">{row.size || '-'}</TableCell>
                            <TableCell>{row.bust || '-'}</TableCell>
                            <TableCell>{row.waist || '-'}</TableCell>
                            <TableCell>{row.hips || '-'}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground pb-1">No size chart available.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Condition>

        <Condition predicate={Boolean(relatedProducts.length)}>
          <RelatedProducts products={relatedProducts as Product[]} />
        </Condition>
      </div>
    </React.Fragment>
  )
}

function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <Condition predicate={Boolean(products.length)}>
      <div className="py-8">
        <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
        <ul className="flex w-full gap-4 overflow-x-auto pt-1">
          <CarouselClient
            products={products}
            autoScrollOption={{
              playOnInit: false,
            }}
          />
        </ul>
      </div>
    </Condition>
  )
}
