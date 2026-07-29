'use server'
import type { CarouselBlock as CarouselBlockProps, Product } from '@/payload-types'

import { DefaultDocumentIDType } from 'payload'
import React from 'react'

import { CarouselClassName, CarouselClient } from './Component.client'
import { getProductWithCacheAPI } from '@/lib/api/product.api.cache'

export const CarouselBlock: React.FC<
  CarouselBlockProps & {
    id?: DefaultDocumentIDType
  } & {
    carouselClassName?: CarouselClassName
  }
> = async (props) => {
  const { id, categories, limit = 3, selectedDocs, carouselTitle, carouselDescription } = props

  const categoryIds = categories?.length ? categories.map((category) => (typeof category === 'object' ? category.id : category)).sort() : []
  const products: Product[] = (
    categoryIds.length > 0
      ? ((await getProductWithCacheAPI({
          depth: 1,
          limit: limit ?? undefined,
          where: {
            categories: {
              in: categoryIds,
            },
          },
        })) ?? [])
      : selectedDocs && selectedDocs?.length > 0
        ? selectedDocs?.map((doc) => {
            if (typeof doc.value === 'object') {
              return doc.value as Product
            }

            return null
          })
        : []
  ).filter((product): product is Product => product != null)

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
