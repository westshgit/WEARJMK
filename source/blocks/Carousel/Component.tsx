import type { CarouselBlock as CarouselBlockProps, Product } from '@/payload-types'

import { DefaultDocumentIDType } from 'payload'
import React from 'react'

import { getProductsFromCategoriesOrSelectedDocs } from '@/lib/api/product.api'
import { CarouselClassName, CarouselClient } from './Component.client'

export const CarouselBlock: React.FC<
  CarouselBlockProps & {
    id?: DefaultDocumentIDType
  } & {
    carouselClassName?: CarouselClassName
  }
> = async (props) => {
  const { id, categories, limit = 3, selectedDocs, carouselTitle, carouselDescription } = props

  const products: Product[] = await getProductsFromCategoriesOrSelectedDocs({
    categories,
    limit,
    selectedDocs,
  })

  if (!products?.length) return null

  return (
    <div className="space-y-9">
      <div className="header-description">
        <h2>{carouselTitle} </h2>
        <p>{carouselDescription}</p>
      </div>

      <div data-slot="carousel-wrapper">
        <CarouselClient products={products} carouselClassName={props.carouselClassName} />
      </div>
    </div>
  )
}
