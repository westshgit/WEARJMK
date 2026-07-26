import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import type { BasePayload, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { genericCollectionChangeHook, getPayloadAPI } from '@/lib/api/shared'
import type { Page, PagesSelect } from '@/payload-types'

type FindPagesOptions = Parameters<BasePayload['find']>[0]

type _GetPagesArgs = Omit<FindPagesOptions, 'select'> & {
  select?: PagesSelect<false> | PagesSelect<true>
}

export type GetPagesArgs = Partial<Omit<_GetPagesArgs, 'collection' | 'draft' | 'overrideAccess' | 'req' | 'user'>>

type PageCacheConfig = {
  keyParts: string[]
  tags: string[]
}

const allPagesCacheConfig: PageCacheConfig = {
  keyParts: ['pages'],
  tags: ['pages'],
}

function getPublishedPageWhere(where: GetPagesArgs['where']) {
  return {
    and: [{ _status: { equals: 'published' } }, ...(where ? [where] : [])],
  }
}

async function findPages({ where, ...rest }: GetPagesArgs, draft: boolean) {
  const payload = await getPayloadAPI()

  return payload.find({
    collection: 'pages',
    draft,
    overrideAccess: draft,
    ...rest,
    where: draft ? where : getPublishedPageWhere(where),
  })
}

function getCachedPublishedPages(args: GetPagesArgs, cacheConfig: PageCacheConfig) {
  const cachedQuery = unstable_cache(
    (findArgs: GetPagesArgs) => findPages(findArgs, false),
    cacheConfig.keyParts,
    {
      tags: cacheConfig.tags,
      revalidate: false,
    },
  )

  return cachedQuery(args)
}

async function getPages(args: GetPagesArgs, cacheConfig: PageCacheConfig) {
  const { isEnabled: draft } = await draftMode()

  if (draft) return findPages(args, true)

  return getCachedPublishedPages(args, cacheConfig)
}

export async function getPageAPI(args: GetPagesArgs = {}) {
  return getPages(args, allPagesCacheConfig)
}

export async function queryPageBySlug({ slug }: { slug: string }): Promise<Page | null> {
  const { docs } = await getPages(
    {
      limit: 1,
      pagination: false,
      where: {
        slug: {
          equals: slug,
        },
      },
    },
    {
      keyParts: ['pages-by-slug', slug],
      tags: [`pages_${slug}`],
    },
  )

  return docs[0] ?? null
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
