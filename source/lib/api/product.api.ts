'use server'

import type { Category, Product } from '@/payload-types'
import { unstable_cache } from 'next/cache'
import { getPayloadAPI } from './shared'

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
    products = await _getProductsByCategory({ categories, limit })
  } else if (selectedDocs?.length) {
    products = selectedDocs.map((post) => {
      if (typeof post.value !== 'string') return post.value
    }) as Product[]
  }

  return products
}
