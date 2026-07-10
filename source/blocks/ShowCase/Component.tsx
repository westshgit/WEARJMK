import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import { Button } from '@/components/ui/button'
import { getProductsFromCategoriesOrSelectedDocs } from '@/lib/api/product.api'
import type { Product, ShowCase as ShowCaseBlockProps } from '@/payload-types'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { DefaultDocumentIDType } from 'payload'
import type React from 'react'

// ShowCase would be used for the landing page and in product page as well.
export const ShowCaseBlock: React.FC<
  ShowCaseBlockProps & {
    id?: DefaultDocumentIDType
  }
> = async ({ showCaseDescription, showCaseTitle, categories, selectedDocs, limit = 4 }) => {
  const products: Product[] = await getProductsFromCategoriesOrSelectedDocs({
    categories,
    limit,
    selectedDocs,
  })

  if (!products?.length) return null

  return (
    <div className="space-y-9">
      <div className="flex items-center justify-between relative">
        <div className="header-description">
          <h2>{showCaseTitle} </h2>
          <p>{showCaseDescription}</p>
        </div>

        <Button
          asChild
          size={'lg'}
          variant={'outline'}
          className="absolute -top-1 right-2 h-9 w-full max-w-32 justify-between border-primary/20 px-6 font-mono text-xs uppercase tracking-[0.18em] text-primary/80 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground md:static md:h-12 md:max-w-72 md:top-auto md:right-auto"
        >
          <Link href="/shop">
            <span>View All</span>
            <ArrowRight className="transition-transform group-hover/button:translate-x-1" />
          </Link>
        </Button>
      </div>

      <Grid className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductGridItem key={product.id} product={product} mediaClassName="p-1! shadow-lg bg-secondary aspect-3/4!" imgClassName="object-top" />
        ))}
      </Grid>
    </div>
  )
}
