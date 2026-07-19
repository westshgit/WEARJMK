import type { Product, Variant } from '@/payload-types'

type Price = Pick<Product, 'priceInNGN'>

export function getPriceWithCurrencyCode(product: Price, code: string): number {
  const priceField = `priceIn${code}` as const

  const price = product[priceField as keyof Price]
  if (typeof price === 'number') {
    return price
  }
  return 0
}
