import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { unstable_cache } from 'next/cache'
import type { Page } from '@/payload-types'
import { getPagesAPI, getPagesAPIWithSlug, type GetPagesArgs } from './page.api'
import { genericCollectionChangeHook } from '@/utilities/genericCollectionHook'

const getCachedPagesAPI = unstable_cache((args: GetPagesArgs) => getPagesAPI({ limit: 1000, pagination: false, ...args }), ['pages', 'all'], {
  tags: ['pages'],
  revalidate: false,
})

export async function getAllPagesWithCacheAPI(args: GetPagesArgs = {}): Promise<Page[] | null> {
  return getCachedPagesAPI(args)
}

export async function getPagesAPIWithSlugAndCacheAPI({
  slug,
  ...rest
}: GetPagesArgs & {
  slug: string
}) {
  return unstable_cache(
    (args: GetPagesArgs & { slug: string }) => getPagesAPIWithSlug(args),
    ['pages', 'slug', slug],
    {
      tags: ['pages', `pages_${slug}`],
      revalidate: false,
    },
  )({
    slug,
    ...rest,
  })
}

export const revalidatePage = genericCollectionChangeHook<CollectionAfterChangeHook<Page>>([
  {
    getCacheKey: () => 'pages',
    tagOrPath: {
      tag: 'tag',
    },
  },
  {
    getCacheKey: ({ doc }) => `pages_${doc.slug}`,
    tagOrPath: {
      tag: 'tag',
    },
    shouldRevalidateHook: ({ doc }) => Boolean(doc.slug),
  },
  {
    getCacheKey: ({ previousDoc }) => `pages_${previousDoc.slug}`,
    tagOrPath: {
      tag: 'tag',
    },
    shouldRevalidateHook: ({ doc, previousDoc }) => Boolean(previousDoc?.slug && previousDoc.slug !== doc.slug),
  },
  {
    getCacheKey: ({ doc }) => (doc.slug === 'home' ? '/' : `/${doc.slug}`),
    tagOrPath: 'path',
    shouldRevalidateHook: ({ doc }) => doc._status === 'published',
  },
  {
    getCacheKey: ({ previousDoc }) => (previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`),
    tagOrPath: 'path',
    shouldRevalidateHook: ({ doc, previousDoc }) => previousDoc?._status === 'published' && doc._status !== 'published',
  },
])

export const revalidateDelete = genericCollectionChangeHook<CollectionAfterDeleteHook<Page>>([
  {
    getCacheKey: () => 'pages',
    tagOrPath: {
      tag: 'tag',
    },
  },
  {
    getCacheKey: ({ doc }) => `pages_${doc.slug}`,
    tagOrPath: {
      tag: 'tag',
    },
    shouldRevalidateHook: ({ doc }) => Boolean(doc.slug),
  },
  {
    getCacheKey: ({ doc }) => (doc?.slug === 'home' ? '/' : `/${doc?.slug}`),
    tagOrPath: 'path',
  },
])
