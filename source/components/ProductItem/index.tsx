'use client'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Product, Variant } from '@/payload-types'
import { getPriceWithCurrencyCode } from '@/utilities'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'

type Props = {
  product: Product
  style?: 'compact' | 'default'
  variant?: Variant
  quantity?: number
  /**
   * Force all formatting to a particular currency.
   */
  currencyCode?: string
}

export const ProductItem: React.FC<Props> = ({ product, style = 'default', quantity, variant, currencyCode }) => {
  const { currency } = useCurrency()
  const { title } = product

  const metaImage = product.meta?.image && typeof product.meta?.image !== 'string' ? product.meta.image : undefined

  const firstGalleryImage = typeof product.gallery?.[0]?.image !== 'string' ? product.gallery?.[0]?.image : undefined

  let image = firstGalleryImage || metaImage

  const isVariant = Boolean(variant) && typeof variant === 'object'

  if (isVariant) {
    const imageVariant = product.gallery?.find((item) => {
      if (!item.variantOption) return false
      const variantOptionID = typeof item.variantOption === 'object' ? item.variantOption.id : item.variantOption

      const hasMatch = variant?.options?.some((option) => {
        if (typeof option === 'object') return option.id === variantOptionID
        else return option === variantOptionID
      })

      return hasMatch
    })

    if (imageVariant && typeof imageVariant.image !== 'string') {
      image = imageVariant.image
    }
  }

  const selectedCurrencyCode = currencyCode ?? currency.code
  const priceSource = isVariant ? variant : product
  const itemPrice = getPriceWithCurrencyCode(priceSource, selectedCurrencyCode)
  const itemURL = `/products/${product.slug}${variant ? `?variant=${variant.id}` : ''}`

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-stretch justify-stretch h-20 w-20 p-2 rounded-lg border">
        <div className="relative w-full h-full">
          {image && typeof image !== 'string' && <Media className="" fill imgClassName="rounded-lg object-cover" resource={image} />}
        </div>
      </div>
      <div className="flex grow justify-between items-center">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-lg">
            <Link href={itemURL} className="font-mono! uppercase text-base!">
              {title}
            </Link>
          </p>
          {variant && (
            <p className="text-sm font-mono text-primary/50 tracking-widest">
              {variant.options
                ?.map((option) => {
                  if (typeof option === 'object') return option.label
                  return null
                })
                .join(', ')}
            </p>
          )}
          <div>
            {'x'}
            {quantity}
          </div>
        </div>

        {itemPrice && quantity && (
          <div className="text-right">
            <p className="font-medium text-xs font-mono! uppercase">Subtotal</p>
            <Price className="font-mono text-primary/50 text-sm" amount={itemPrice * quantity} currencyCode={selectedCurrencyCode} />
          </div>
        )}
      </div>
    </div>
  )
}
