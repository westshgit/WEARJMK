import type { BasePayload } from 'payload'

import type { Cart, CartsSelect } from '@/payload-types'
import { getPayloadAPI } from './shared'

type FindCartsOptions = Parameters<BasePayload['find']>[0]

type _GetCartsArgs = Omit<FindCartsOptions, 'select'> & {
  select?: CartsSelect<false> | CartsSelect<true>
}

export type GetCartsArgs = Partial<Omit<_GetCartsArgs, 'collection' | 'overrideAccess' | 'req' | 'user'>>

export async function getCartAPI({ select, ...rest }: GetCartsArgs): Promise<Cart[] | null> {
  const payload = await getPayloadAPI()

  const findArgs = {
    collection: 'carts',
    overrideAccess: true,
    ...(select ? { select } : {}),
    ...rest,
  } as _GetCartsArgs

  try {
    const { docs } = await payload.find(findArgs)
    return docs as Cart[]
  } catch (error) {
    console.error('Error fetching carts:', error)
    return null
  }
}

export async function getCartByIdAPI(cartId: number): Promise<Cart | null> {
  const getCartById = await getCartAPI({
    depth: 2,
    limit: 1,
    pagination: false,
    where: {
      id: {
        equals: cartId,
      },
    },
  })

  if (!getCartById || getCartById.length === 0) {
    return null
  }

  const cart = getCartById[0] as Cart | undefined
  return cart ?? null
}

export const getCartById = getCartByIdAPI
