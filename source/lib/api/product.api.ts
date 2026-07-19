'use server'

import type { Category, Product } from '@/payload-types'
import { unstable_cache } from 'next/cache'
import { getPayloadAPI } from './shared'
import { draftMode } from 'next/headers'

async function _getProductsByCategory({ categories, limit }: { categories?: (number | Category)[] | null; limit: number | null }): Promise<Product[]> {
  const payload = await getPayloadAPI()

  const flattenedCategories = categories?.length ? categories.map((category) => (typeof category === 'object' ? category.id : category)) : null

  const fetchedProducts = await payload.find({
    collection: 'products',
    depth: 1,
    limit: limit || undefined,
    ...(flattenedCategories?.length ? { where: { categories: { in: flattenedCategories } } } : {}),
  })

  return fetchedProducts.docs
}

export async function getProductsByCategory({ categories, limit }: { categories?: (number | Category)[] | null; limit: number | null }): Promise<Product[]> {
  const flattenedCategories = categories?.length ? categories.map((c) => (typeof c === 'object' ? c.id : c)).sort() : []

  return unstable_cache(() => _getProductsByCategory({ categories, limit }), ['products-by-category', flattenedCategories.join(','), String(limit)], {
    tags: ['products', ...flattenedCategories.map((id) => `products-category-${id}`)],
    revalidate: 3600,
  })()
}

export async function getProductsFromCategoriesOrSelectedDocs({
  categories,
  limit,
  selectedDocs,
}: {
  categories?: (number | Category)[] | null
  limit: number | null
  selectedDocs?:
    | {
        relationTo: 'products'
        value: number | Product
      }[]
    | null
}): Promise<Product[]> {
  let products: Product[] = []

  if (categories?.length) {
    // was calling the uncached _getProductsByCategory directly — use the cached export
    products = await getProductsByCategory({ categories, limit })
  } else if (selectedDocs?.length) {
    // this branch is pure in-memory mapping, no fetch — nothing to cache here
    products = selectedDocs.map((post) => {
      if (typeof post.value !== 'string') return post.value
    }) as Product[]
  }

  return products
}

async function _queryProductBySlug({ slug }: { slug: string }): Promise<Product | null> {
  const payload = await getPayloadAPI()

  const result = await payload.find({
    collection: 'products',
    depth: 3,
    draft: false,
    limit: 1,
    pagination: false,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    populate: {
      variants: {
        title: true,
        priceInNGN: true,
        inventory: true,
        options: true,
      },
    },
  })

  return result.docs?.[0] || null
}

export async function queryProductBySlug({ slug }: { slug: string }): Promise<Product | null> {
  const { isEnabled: draft } = await draftMode()

  // never cache draft content — bypass entirely so editors always see live data
  if (draft) {
    const payload = await getPayloadAPI()
    const result = await payload.find({
      collection: 'products',
      depth: 3,
      draft: true,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { and: [{ slug: { equals: slug } }] },
      populate: {
        variants: {
          title: true,
          priceInNGN: true,
          inventory: true,
          options: true,
        },
      },
    })
    return result.docs?.[0] || null
  }

  return unstable_cache(() => _queryProductBySlug({ slug }), ['product-by-slug', slug], {
    tags: ['products', `product-${slug}`],
    revalidate: 3600,
  })()
}
