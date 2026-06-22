'use client'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { Suspense } from 'react'

import type { Header } from '@/payload-types'
import { BrandWordmark } from './BrandWordmark'
import { MobileMenu } from './MobileMenu'

import { cn } from '@/utilities/cn'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Search } from './SearchHeader'
import { CurrencySelector } from './CurrencySelector'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  const menu = header.navItems || []
  const pathname = usePathname()

  return (
    <>
      <div>
        <nav className="container flex items-center gap-4 p-4 xl:px-0">
          {/* Mobile menu — hidden on md+ */}
          <div className="md:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={menu} />
            </Suspense>
          </div>

          <Link aria-label="WearJMK HOME" href="/">
            <BrandWordmark />
          </Link>

          {/* Desktop nav links */}
          {menu.length ? (
            <ul className="hidden md:flex items-center gap-4 text-sm">
              {menu.map((item) => (
                <li key={item.id}>
                  <CMSLink
                    {...item.link}
                    size="clear"
                    appearance="nav"
                    className={cn('font-normal hover:underline transition-all duration-300 ease-in-out', {
                      active: item.link.url && item.link.url !== '/' ? pathname.includes(item.link.url) : false,
                    })}
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {/* Search takes all remaining space */}
          <Search className="hidden md:flex flex-1" />

          <div className="flex items-center max-md:flex-1 max-md:justify-end">
            <div className="hidden md:block">
              <CurrencySelector />
            </div>
            {/* Pinned to the right of search */}
            <Suspense fallback={<OpenCartButton />}>
              <Cart />
            </Suspense>
            <div className="hidden md:block">
              <ThemeSelector />
            </div>
          </div>
        </nav>
        <Search className="md:hidden px-4 py-2" />
        <Separator />
      </div>
    </>
  )
}
