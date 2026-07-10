import { Categories } from '@/components/layout/search/Categories'
import { FilterList } from '@/components/layout/search/filter'
import { sorting } from '@/lib/constants'
import { Search } from '@/components/Search'
import React, { Suspense } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RiArrowRightLine, RiMoreLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <div className="container grid md:gap-y-16 mt-8 mb-16 md:mt-16 md:grid-cols-[minmax(0,170px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,250px)_minmax(0,1fr)]">
        <div className="md:col-span-2">
          <Search />
        </div>

        <div className="hidden md:block md:space-y-6">
          <Categories />
          <FilterList list={sorting} title="Sort by" />
        </div>
        <div className="md:hidden  mt-2 mb-12 md:mt-0 md:mb-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-muted-foreground/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground gap-1.5 px-4">
                More
                <RiMoreLine className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start">
              <Categories />
              <FilterList list={sorting} title="Sort by" />
            </PopoverContent>
          </Popover>
        </div>

        <div className="min-h-screen w-full">{children}</div>
      </div>
    </Suspense>
  )
}
