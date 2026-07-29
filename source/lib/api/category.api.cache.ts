import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import type { Category } from '@/payload-types'
import { getAllCategoriesAPI, getCategoryAPI, type GetCategoriesArgs } from './category.api'
import { unstable_cache } from 'next/cache'
import { genericCollectionChangeHook } from '@/utilities/genericCollectionHook'

type GetCachedCategoriesArgs = Omit<GetCategoriesArgs, 'overrideAccess' | 'user'>

const getCachedAllCategoriesAPI = unstable_cache(getAllCategoriesAPI, ['categories', 'all'], {
  tags: ['categories'],
  revalidate: false,
})

const getCachedCategoriesAPI = unstable_cache((args: GetCachedCategoriesArgs) => getCategoryAPI(args), ['categories', 'find'], {
  tags: ['categories'],
  revalidate: false,
})

export async function getAllCategoriesWithCacheAPI(): Promise<Category[] | null> {
  return getCachedAllCategoriesAPI()
}

export async function getCategoriesWithCacheAPI(args: GetCachedCategoriesArgs = {}): Promise<Category[] | null> {
  return getCachedCategoriesAPI(args)
}

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
