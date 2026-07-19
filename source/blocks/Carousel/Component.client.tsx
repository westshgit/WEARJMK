'use client'
import type { Media, Product } from '@/payload-types'

import { GridTileImage } from '@/components/Grid/tile'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import AutoScroll, { AutoScrollOptionsType } from 'embla-carousel-auto-scroll'
import Link from 'next/link'
import React from 'react'
import { cn, getPriceWithCurrencyCode } from '@/utilities'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'

export interface CarouselClassName {
  carousel?: string
  carouselItem?: string
  carouselContent?: string
}

export const CarouselClient: React.FC<{ products: Product[]; carouselClassName?: CarouselClassName; autoScrollOption?: AutoScrollOptionsType }> = ({
  products,
  carouselClassName,
  autoScrollOption,
}) => {
  if (!products?.length) return null
  const { currency } = useCurrency()

  const defaultAutoScrollOption: AutoScrollOptionsType = {
    playOnInit: true,
    speed: 0.75,
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  }

  const mergedAutoScrollOption = { ...defaultAutoScrollOption, ...autoScrollOption }

  return (
    <Carousel
      className={cn('w-full', carouselClassName?.carousel)}
      opts={{ align: 'start', loop: true }}
      plugins={[
        AutoScroll({
          ...mergedAutoScrollOption,
        }),
      ]}
    >
      <CarouselContent className={cn(carouselClassName?.carouselContent)}>
        {products.map((product, i) => {
          if (!product) return null
          const amount = getPriceWithCurrencyCode(product, currency.code)

          return (
            <CarouselItem
              className={cn('relative aspect-3/4 flex-none w-3/4 max-w-70 md:max-w-80 md:w-1/2 lg:w-1/3', carouselClassName?.carouselItem)}
              key={`${product.slug}${i}`}
            >
              <Link className="relative h-full w-full" href={`/products/${product.slug}`}>
                <GridTileImage
                  label={{
                    amount: amount,
                    title: product.title,
                  }}
                  media={product.meta?.image as Media}
                  classNames={{
                    mediaClassName: 'p-1 shadow-2xl bg-secondary',
                    imgClassName: 'object-top',
                  }}
                />
              </Link>
            </CarouselItem>
          )
        })}
      </CarouselContent>
    </Carousel>
  )
}
