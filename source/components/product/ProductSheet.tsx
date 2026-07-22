'use client'

import { RiMoreFill } from '@remixicon/react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ProductDescription } from './ProductDescription'
import { Button } from '../ui/button'
import { Suspense, useState } from 'react'
import { AddToCart } from '../Cart/AddToCart'
import { PlusIcon, ShoppingCartIcon } from 'lucide-react'
import { Product } from '@/payload-types'
import Condition from '../Condition'
import { Price } from '../Price'

export default function ProductSheet({ product, price }: { product: Product; price: number }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet modal={false} open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="flex items-center justify-between w-full gap-2 px-4 pt-2 shadow-2xl pb-6">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Viewing:</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h6 className="font-mono uppercase text-base">{product.title}</h6>
                <Suspense fallback={null}>
                  <AddToCart product={product}>
                    <span className="relative inline-flex">
                      <ShoppingCartIcon className="size-5" />
                      <PlusIcon className="absolute -top-1.5 -right-1.5 size-3 rounded-full bg-primary text-primary-foreground p-0.5" strokeWidth={3} />
                    </span>
                  </AddToCart>
                </Suspense>
              </div>

              <Condition predicate={!open && Boolean(price)}>
                <Button variant={'outline'}>
                  <Price amount={price} />
                </Button>
              </Condition>
            </div>
          </div>

          <Button className="" variant={'outline'} type="button" size={'xs'}>
            More <RiMoreFill />
          </Button>
        </div>
      </SheetTrigger>

      <SheetContent side="bottom" overlay={false} className="h-[50dvh] overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden p-4 rounded-t-xl">
        <div className="flex-1 max-h-[50dvh] overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
          <ProductDescription product={product} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
