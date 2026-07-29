import type { Cart } from '@/payload-types'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { getCartByIdAPI } from './cart.api'
import { unstable_cache } from 'next/cache'
import { genericCollectionChangeHook } from '@/utilities/genericCollectionHook'

export async function getCartByIdWithCacheAPI(cartId: number): Promise<Cart | null> {
  return unstable_cache(() => getCartByIdAPI(cartId), ['cart', String(cartId)], {
    tags: [`cart-${cartId}`],
    revalidate: false,
  })()
}

export const revalidateCart = genericCollectionChangeHook<CollectionAfterChangeHook<Cart>>([
  {
    getCacheKey: () => 'carts',
    tagOrPath: {
      tag: 'tag',
    },
  },
  {
    getCacheKey: ({ doc }) => `cart-${doc.id}`,
    tagOrPath: {
      tag: 'tag',
    },
  },
])

export const revalidateCartDelete = genericCollectionChangeHook<CollectionAfterDeleteHook<Cart>>([
  {
    getCacheKey: () => 'carts',
    tagOrPath: {
      tag: 'tag',
    },
  },
  {
    getCacheKey: ({ doc }) => `cart-${doc.id}`,
    tagOrPath: {
      tag: 'tag',
    },
  },
])
