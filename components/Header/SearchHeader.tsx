import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty'
import { RiSearchLine, RiFileListLine } from '@remixicon/react'
import { useState } from 'react'

export function Search({ className }: { className?: string }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const resultOfProductsAndOrder = []

  return (
    <div className={cn('w-full', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        {/* Anchor wraps only the input so the popover width tracks the input */}
        <PopoverAnchor asChild>
          <div className="relative w-full md:flex md:items-center md:justify-end">
            <div className="absolute right-4 top-1.5 pointer-events-none">
              <RiSearchLine className="text-muted-foreground" />
            </div>
            <Input
              className="w-full max-w-md placeholder:text-xs placeholder:md:text-sm"
              placeholder="Search products or track an order…"
              aria-label="Search products or track an order"
              value={query}
              onChange={(e) => {
                const val = e.currentTarget.value
                setQuery(val)
                setIsOpen(val.length > 0)
              }}
              onFocus={() => {
                if (query.length > 0) setIsOpen(true)
              }}
            />
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="end"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={() => setIsOpen(false)}
          className="w-(--radix-popover-trigger-width) min-h-96 p-4"
        >
          {resultOfProductsAndOrder.length > 0 ? (
            <div className="flex flex-col gap-2">{/* result items go here */}</div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <RiSearchLine className="size-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>Find anything, fast</EmptyTitle>
                <EmptyDescription>Search by product name, category, or paste your order number to get live tracking updates.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <RiSearchLine className="size-4 shrink-0" />
                    <span>
                      Try <span className="text-foreground font-medium">"oversized tee"</span> or{' '}
                      <span className="text-foreground font-medium">"cargo pants"</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiFileListLine className="size-4 shrink-0" />
                    <span>
                      Paste an order ID like <span className="text-foreground font-medium">#WJK-00412</span> to track it
                    </span>
                  </div>
                </div>
              </EmptyContent>
            </Empty>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
