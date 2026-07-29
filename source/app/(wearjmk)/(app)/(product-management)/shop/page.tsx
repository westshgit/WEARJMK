import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import { getProductAPI } from '@/lib/api/product.api'

export const metadata = {
  description: 'Search for products in the store.',
  title: 'Shop',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, category } = await searchParams

  const products =
    (await getProductAPI({
      draft: false,
      select: {
        title: true,
        slug: true,
        gallery: true,
        categories: true,
        priceInNGN: true,
      },
      ...(sort ? { sort } : { sort: 'title' }),
      ...(searchValue || category
        ? {
            where: {
              and: [
                {
                  _status: {
                    equals: 'published',
                  },
                },
                ...(searchValue
                  ? [
                      {
                        or: [
                          {
                            title: {
                              like: searchValue,
                            },
                          },
                          {
                            description: {
                              like: searchValue,
                            },
                          },
                        ],
                      },
                    ]
                  : []),
                ...(category
                  ? [
                      {
                        categories: {
                          contains: category,
                        },
                      },
                    ]
                  : []),
              ],
            },
          }
        : {}),
    })) ?? []
  const resultsText = products?.length > 1 ? 'results' : 'result'

  return (
    <div>
      {searchValue ? (
        <p className="mb-4">
          {products?.length === 0 ? 'There are no products that match ' : `Showing ${products.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {!searchValue && products?.length === 0 && <p className="mb-4">No products found. Please try different filters.</p>}

      {products?.length > 0 ? (
        <Grid className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            return <ProductGridItem key={product.id} product={product} mediaClassName="p-1! shadow bg-secondary aspect-3/4!" imgClassName="object-top" />
          })}
        </Grid>
      ) : null}
    </div>
  )
}
