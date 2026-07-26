import { Cart } from '@/payload-types'
import { CacheKey, genericCollectionChangeHook, getPayloadAPI } from './shared'
import { unstable_cache } from 'next/cache'
import { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

async function _getCartById(cartId: number): Promise<Cart | null> {
  const payload = await getPayloadAPI()

  const cart = await payload.findByID({
    collection: 'carts',
    id: cartId.toString(),
    depth: 2,
  })

  return cart as Cart | null
}

export async function getCartById(cartId: number) {
  return unstable_cache(() => _getCartById(cartId), ['cart', cartId.toString()], {
    tags: [getCartByIdCacheKey(cartId)],
    revalidate: false,
  })()
}

export const getCartByIdCacheKey: CacheKey<number | string> = (args) => `cart-${args}`

export const revalidateCart = genericCollectionChangeHook<CollectionAfterChangeHook<Cart>>([
  {
    getCacheKey: ({ doc }) => getCartByIdCacheKey(doc.id),
    tagOrPath: {
      tag: 'tag',
    },
  },
])

export const revalidateCartDelete = genericCollectionChangeHook<CollectionAfterDeleteHook<Cart>>([
  {
    getCacheKey: ({ doc }) => getCartByIdCacheKey(doc.id),
    tagOrPath: {
      tag: 'tag',
    },
  },
])
