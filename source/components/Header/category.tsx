'use client'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Category } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { RiArrowDownSLine, RiGridLine } from '@remixicon/react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const MotionArrow = motion.create(RiArrowDownSLine)

type Props = {
  categories: Category[]
  className?: string
}

function createCategoryHref(category: Category): string | null {
  if (category?.slug) {
    return `/category/${category.slug}`
  }
  return null
}

export function CategoryNav({ categories, className }: Props) {
  const pathname = usePathname()

  return (
    <nav aria-label="Category navigation" className={cn('w-full border-y border-border', className)}>
      <div
        className={cn('container flex items-center gap-6 md:gap-10', 'overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none')}
      >
        <AllCategories categories={categories} />

        {categories.slice(0, 10).map((category) => {
          const categoryHref = createCategoryHref(category)
          if (!categoryHref) return null

          return (
            <Link
              key={category.id}
              href={categoryHref}
              className="relative shrink-0 py-3 md:py-4 text-[11px] md:text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground data-[active=true]:text-foreground"
              data-active={pathname === categoryHref}
            >
              {category.title}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function AllCategories({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={'ghost'}>
          <RiGridLine className="size-3.5" />
          All Categories
          <MotionArrow className="size-3.5" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal forceMount>
        <AnimatePresence>
          <DropdownMenuContent asChild align="start">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: -8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: -8,
              }}
              transition={{
                duration: 0.18,
                ease: 'easeOut',
              }}
              className="w-56 origin-top-left space-y-1.5"
            >
              {categories.map((category) => (
                <DropdownMenuItem key={category.id} asChild>
                  <Link href={createCategoryHref(category) ?? '#'} className="text-xs uppercase tracking-widest text-foreground/80">
                    {category.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </motion.div>
          </DropdownMenuContent>
        </AnimatePresence>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}
