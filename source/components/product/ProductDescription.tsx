'use client'
import type { Product, Variant } from '@/payload-types'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import { Suspense } from 'react'

import { VariantSelector } from './VariantSelector'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'
import { Button } from '../ui/button'
import { RiMoreFill } from '@remixicon/react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { PlusIcon, ShoppingCartIcon } from 'lucide-react'
import { createCategoryHref } from '@/utilities'
import Link from 'next/link'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0
  const priceField = `priceIn${currency.code}` as keyof Product
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const priceField = `priceIn${currency.code}` as keyof Variant
    const variantsOrderedByPrice = product.variants?.docs
      ?.filter((variant) => variant && typeof variant === 'object')
      .sort((a, b) => {
        if (
          typeof a === 'object' &&
          typeof b === 'object' &&
          priceField in a &&
          priceField in b &&
          typeof a[priceField] === 'number' &&
          typeof b[priceField] === 'number'
        ) {
          return a[priceField] - b[priceField]
        }

        return 0
      }) as Variant[]

    const lowestVariant = variantsOrderedByPrice[0][priceField]
    const highestVariant = variantsOrderedByPrice[variantsOrderedByPrice.length - 1][priceField]
    if (variantsOrderedByPrice && typeof lowestVariant === 'number' && typeof highestVariant === 'number') {
      lowestAmount = lowestVariant
      highestAmount = highestVariant
    }
  } else if (product[priceField] && typeof product[priceField] === 'number') {
    amount = product[priceField]
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 flex-col xl:flex-row xl:items-center xl:justify-between">
        <div className="relative">
          <div className="flex items-center gap-2">
            <h1 className="text-lg uppercase md:text-2xl font-medium">{product.title}</h1>

            <Suspense fallback={null}>
              <AddToCart product={product}>
                <span className="relative inline-flex">
                  <ShoppingCartIcon className="size-5" />
                  <PlusIcon className="absolute -top-1.5 -right-1.5 size-3 rounded-full bg-primary text-primary-foreground p-0.5" strokeWidth={3} />
                </span>
              </AddToCart>
            </Suspense>
          </div>

          {product.categories && product.categories.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="text-xs space-x-1 mt-2">
                  <span className="select-none font-mono!">Products in</span>
                  <Button size={'xs'}>
                    {typeof product.categories[0] === 'object' ? product.categories[0].title : 'Category'} & <RiMoreFill />
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>More Categories</DropdownMenuLabel>
                {product.categories.map((category) => {
                  if (!category || typeof category !== 'object') return null
                  const { id, title } = category
                  const href = createCategoryHref(category)
                  if (!href) return null
                  return (
                    <DropdownMenuItem key={id} asChild>
                      <Link href={href}>{title}</Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <div className="flex items-center justify-end">
          <Button variant={'outline'} type="button" className="pointer-events-none!">
            {hasVariants ? <Price highestAmount={highestAmount} lowestAmount={lowestAmount} /> : <Price amount={amount} />}
          </Button>
        </div>
      </div>
      <hr />
      <div className="font-mono">
        <p className="text-muted-foreground leading-relaxed max-w-prose">{product.productDescription}</p>
      </div>

      {product.productInformation && product.productInformation.length > 0 ? (
        <div className="border border-border">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
            <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold text-muted-foreground">Specification</h4>
            <span className="text-[10px] font-mono text-muted-foreground">{String(product.productInformation.length).padStart(2, '0')}</span>
          </div>
          <div className="divide-y divide-border">
            {product.productInformation.map(({ id, info }, i) => (
              <div key={id} className="flex items-baseline gap-3 px-3 py-2">
                <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-xs font-mono">{info}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {product.coreInstructions && product.coreInstructions.length > 0 ? (
        <div className="relative border border-dashed border-border px-4 pt-4 pb-3">
          <span className="absolute -top-2.5 left-3 bg-background px-2 text-[10px] tracking-[0.2em] uppercase font-bold text-muted-foreground">Care</span>
          <ul className="space-y-1.5">
            {product.coreInstructions.map(({ id, info }) => (
              <li key={id} className="flex gap-2 text-xs font-mono">
                <span className="select-none text-[9px] mt-0.5 shrink-0 text-muted-foreground/50">✦</span>
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {hasVariants && (
        <>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>

          <hr />
        </>
      )}
      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <StockIndicator product={product} />
        </Suspense>
      </div>
      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <AddToCart product={product} />
        </Suspense>
      </div>
    </div>
  )
}
