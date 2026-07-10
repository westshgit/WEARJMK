'use client'

import type { Product } from '@/payload-types'

import React from 'react'
import { CarouselClient } from '../Carousel/Component.client'

type Props = {
  products: Product[]
}

export const TwoSideWithContentCarousel: React.FC<Props> = ({ products }) => {
  if (!products?.length) return null

  return (
    <CarouselClient
      products={products}
      autoScrollOption={{
        playOnInit: false,
      }}
    />
  )
}
