import type { Category } from '@/payload-types'
import { unstable_cache } from 'next/cache'
import { genericCollectionChangeHook, getPayloadAPI } from './shared'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

async function _fetchCategories(): Promise<Category[]> {
  const payload = await getPayloadAPI()

  const { docs } = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 100,
    disableErrors: true,
    select: {
      slug: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      generatedSlug: true,
    },
  })
  return docs
}

export const fetchCategories = unstable_cache(_fetchCategories, ['categories'], {
  tags: ['categories'],
  revalidate: 3600,
})

export const revalidateCategories = genericCollectionChangeHook<CollectionAfterChangeHook<Category>>([
  {
    getCacheKey: () => 'categories',
    tagOrPath: {
      tag: 'tag',
    },
  },
])

export const revalidateCategoriesDelete = genericCollectionChangeHook<CollectionAfterDeleteHook<Category>>([
  {
    getCacheKey: () => 'categories',
    tagOrPath: {
      tag: 'tag',
    },
  },
])
