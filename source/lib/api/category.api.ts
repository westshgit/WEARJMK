import type { CategoriesSelect, Category } from '@/payload-types'
import { getPayloadAPI } from './shared'
import { BasePayload } from 'payload'

type FindCategoriesOptions = Parameters<BasePayload['find']>[0]

type _GetCategoriesArgs = Omit<FindCategoriesOptions, 'select'> & {
  select?: CategoriesSelect<false> | CategoriesSelect<true>
}

export type GetCategoriesArgs = Partial<Omit<_GetCategoriesArgs, 'collection' | 'req'>>

export async function getCategoryAPI({ select, overrideAccess, ...rest }: GetCategoriesArgs): Promise<Category[] | null> {
  const payload = await getPayloadAPI()

  try {
    const { docs } = await payload.find({
      collection: 'categories',
      overrideAccess: overrideAccess ?? true,
      ...(select ? { select } : {}),
      ...rest,
    } as _GetCategoriesArgs)

    return docs as Category[]
  } catch (error) {
    console.error('Error fetching categories:', error)
    return null
  }
}

export async function getAllCategoriesAPI(): Promise<Category[] | null> {
  return getCategoryAPI({ limit: 1000, pagination: false })
}
