import { Button } from '@/components/ui/button'
import { getProductsFromCategoriesOrSelectedDocs } from '@/lib/api/product.api'
import type { Product, TwoSideWithContent as TwoSideWithContentProps } from '@/payload-types'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { DefaultDocumentIDType } from 'payload'
import type React from 'react'

import { TwoSideWithContentCarousel } from './Component.client'

export const TwoSideWithContentBlock: React.FC<
  TwoSideWithContentProps & {
    id?: DefaultDocumentIDType
  }
> = async ({ limit = null, selectedDocs, categories, twoSideTitle, twoSideDescription }) => {
  const products: Product[] = await getProductsFromCategoriesOrSelectedDocs({
    categories,
    limit,
    selectedDocs,
  })

  if (!products?.length) return null

  return (
    <div className="space-y-12 pt-9 md:pt-12">
      <div className="flex flex-col gap-9 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl uppercase w-[10ch] lg:w-full">{twoSideTitle}</h1>
          <p className="text-foreground/70 font-mono!">{twoSideDescription}</p>
        </div>

        <Button
          asChild
          size={'lg'}
          variant={'outline'}
          className="h-16 w-full max-w-72 justify-between border-primary/20 px-6 font-mono text-xs uppercase tracking-[0.18em] text-primary/80 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground md:h-12"
        >
          <Link href="/shop">
            <span>View Collection</span>
            <ArrowRight className="transition-transform group-hover/button:translate-x-1" />
          </Link>
        </Button>
      </div>

      <div className="w-full">
        <TwoSideWithContentCarousel products={products} />
      </div>
    </div>
  )
}
