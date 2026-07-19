// lib/cart-subtotal.ts
import { CartItem } from '@/components/Cart'
import type { Product, Variant } from '@/payload-types'
import { getPriceWithCurrencyCode } from '@/utilities'

export function computeCartSubtotal(items: CartItem[], currencyCode: string): number {
  return items.reduce((sum, item) => {
    const priceSource = item.variant && typeof item.variant === 'object' ? item.variant : (item.product as Product)
    const price = getPriceWithCurrencyCode(priceSource, currencyCode)
    return sum + price * item.quantity
  }, 0)
}
