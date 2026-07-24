'use server'

import { Cart } from '@/patches/dist/types'
import { getPayloadAPI } from './shared'
import { unstable_cache } from 'next/cache'

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
    tags: [`cart-${cartId}`],
    revalidate: 60, // seconds — tune or drop if you want tag-only invalidation
  })()
}
