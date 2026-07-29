import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Product } from '@/payload-types'
import { getProductAPI, getProductAPIWithSlug, GetProductsArgs } from './product.api'
import { unstable_cache } from 'next/cache'
import { CacheKey, genericCollectionChangeHook } from '@/utilities/genericCollectionHook'
const getProductBySlugCacheKey: CacheKey<string> = (slug) => `product-${slug}`

const getCachedProductsAPI = unstable_cache(
  ({ select, ...rest }: GetProductsArgs) =>
    getProductAPI({
      select,
      draft: false,
      ...rest,
    }),
  ['products', 'find'],
  {
    tags: ['products'],
    revalidate: false,
  },
)

export async function getProductWithCacheAPI({ select, ...rest }: GetProductsArgs): Promise<Product[] | null> {
  return getCachedProductsAPI({
    select,
    ...rest,
  })
}

export async function getProductAPIWithSlugAndCacheAPI({
  slug,
  ...rest
}: GetProductsArgs & {
  slug: string
}) {
  const cacheKey = getProductBySlugCacheKey(slug)

  return unstable_cache((args: GetProductsArgs & { slug: string }) => getProductAPIWithSlug(args), ['products', 'slug', slug], {
    tags: ['products', cacheKey],
    revalidate: false,
  })({
    slug,
    ...rest,
  })
}

export const revalidateProduct = genericCollectionChangeHook<CollectionAfterChangeHook<Product>>([
  {
    getCacheKey: () => 'products',
    tagOrPath: {
      tag: 'tag',
    },
  },
  {
    getCacheKey: ({ doc }) => getProductBySlugCacheKey(doc.slug),
    tagOrPath: {
      tag: 'tag',
    },
    shouldRevalidateHook: ({ doc }) => Boolean(doc.slug),
  },
  {
    getCacheKey: ({ previousDoc }) => getProductBySlugCacheKey(previousDoc.slug),
    tagOrPath: {
      tag: 'tag',
    },
    shouldRevalidateHook: ({ doc, previousDoc }) => Boolean(previousDoc?.slug && previousDoc.slug !== doc.slug),
  },
  {
    getCacheKey: ({ doc }) => `/products/${doc.slug}`,
    tagOrPath: 'path',
    shouldRevalidateHook: ({ doc }) => doc._status === 'published' && Boolean(doc.slug),
  },
  {
    getCacheKey: ({ previousDoc }) => `/products/${previousDoc.slug}`,
    tagOrPath: 'path',
    shouldRevalidateHook: ({ doc, previousDoc }) => Boolean(previousDoc?.slug && previousDoc._status === 'published' && previousDoc.slug !== doc.slug),
  },
])

export const revalidateProductDelete = genericCollectionChangeHook<CollectionAfterDeleteHook<Product>>([
  {
    getCacheKey: () => 'products',
    tagOrPath: {
      tag: 'tag',
    },
  },
  {
    getCacheKey: ({ doc }) => getProductBySlugCacheKey(doc.slug),
    tagOrPath: {
      tag: 'tag',
    },
    shouldRevalidateHook: ({ doc }) => Boolean(doc.slug),
  },
  {
    getCacheKey: ({ doc }) => `/products/${doc.slug}`,
    tagOrPath: 'path',
    shouldRevalidateHook: ({ doc }) => doc._status === 'published' && Boolean(doc.slug),
  },
])
