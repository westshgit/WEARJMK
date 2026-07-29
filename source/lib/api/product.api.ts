'use server'

import type { BasePayload } from 'payload'

import type { Product, ProductsSelect } from '@/payload-types'
import { getPayloadAPI } from './shared'
import { notDraftWhereFilter } from '@/utilities/notDraftWhereFilter'

type FindProductsOptions = Parameters<BasePayload['find']>[0]

type _GetProductsArgs = Omit<FindProductsOptions, 'select'> & {
  select?: ProductsSelect<false> | ProductsSelect<true>
}

export type GetProductsArgs = Partial<Omit<_GetProductsArgs, 'collection' | 'draft' | 'overrideAccess' | 'req'>>

export async function getProductAPI({
  select,
  draft = true,
  ...rest
}: GetProductsArgs & {
  draft?: boolean
}): Promise<Product[] | null> {
  const payload = await getPayloadAPI()

  const findArgs = {
    collection: 'products',
    draft,
    overrideAccess: draft,
    where: draft ? rest.where : notDraftWhereFilter(rest.where ?? {}),
    ...(select ? { select } : {}),
    ...rest,
  } as _GetProductsArgs

  try {
    const { docs } = await payload.find(findArgs)
    return docs as Product[]
  } catch (error) {
    console.error('Error fetching products:', error)
    return null
  }
}

export async function getProductAPIWithSlug({
  slug,
  draft = false,
  ...rest
}: GetProductsArgs & {
  slug: string
  draft?: boolean
}) {
  const docs = await getProductAPI({
    limit: 1,
    depth: 3,
    pagination: false,
    where: {
      and: [{ slug: { equals: slug } }, ...(rest.where ? [rest.where] : [])],
    },
    populate: {
      variants: {
        title: true,
        priceInNGN: true,
        inventory: true,
        options: true,
      },
    },
    draft,
    ...rest,
  })
  return docs && docs.length > 0 ? docs[0] : null
}
