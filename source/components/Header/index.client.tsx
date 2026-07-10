'use client'
import BrandImage from '@/components/BrandImage'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import CurrencySelector from '@/components/CurrencySelector'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CREATE_ACCOUNT_ICON, LOGIN_ICON } from '@/lib/constants.client'
import type { Category } from '@/payload-types'
import { useAuth } from '@/providers'
import { RiHeart2Line, RiLogoutBoxRLine, RiMore2Fill, RiUserLine } from '@remixicon/react'
import { AnimatePresence, motion, Transition } from 'motion/react'
import Link from 'next/link'
import { Suspense, useMemo, useState } from 'react'
import { CategoryNav } from './category'
import { SearchInput, SearchToggle } from './search.client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

const greetings = ['Good to See You', 'Welcome Back', 'It Starts Here', 'Your Style Awaits', 'Welcome to WearJMK'] as const
const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

const dropdownTransition = { duration: 0.15, ease: [0.16, 1, 0.3, 1] } satisfies Transition
type Props = {
  categories: Category[]
}

export function HeaderClient({ categories }: Props) {
  const { user } = useAuth()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <div className="relative container">
      <div className="p-4 flex items-center justify-between gap-2">
        <div data-left className="flex items-center shrink-0">
          <BrandImage />
        </div>
        <div className="hidden md:block w-full">
          <SearchInput />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="md:hidden">
            <SearchToggle open={mobileSearchOpen} onToggle={() => setMobileSearchOpen((v) => !v)} />
          </div>

          <Suspense fallback={<OpenCartButton />}>
            <Cart />
          </Suspense>
          <MobileMenu user={user} />
        </div>
      </div>
      <motion.div
        initial={false}
        animate={mobileSearchOpen ? 'open' : 'closed'}
        variants={{
          open: {
            height: 'auto',
            opacity: 1,
          },
          closed: {
            height: 0,
            opacity: 0,
          },
        }}
        className="overflow-hidden md:hidden"
      >
        <div className="px-2">
          <SearchInput autoFocus={mobileSearchOpen} />
        </div>
      </motion.div>
      <CategoryNav categories={categories} />
    </div>
  )
}

function MobileMenu({ user }: { user: unknown }) {
  const greeting = useMemo(() => {
    return greetings[Math.floor(Math.random() * greetings.length)]
  }, [])

  if (!user) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size={'sm'} className="relative">
            <RiMore2Fill />
          </Button>
        </DialogTrigger>
        <AnimatePresence>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-sm md:w-auto mt-2 md:mt-1" forceMount>
            <motion.div variants={dropdownVariants} className="mx-2!" initial="hidden" animate="visible" exit="hidden" transition={dropdownTransition}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-mono">{greeting}</DialogTitle>
                <DialogDescription>Sign in or create an account to save your favorites, manage your orders, and enjoy a faster checkout.</DialogDescription>
              </DialogHeader>

              <div className="mt-6 flex *:flex-1 gap-2 *:*:w-full *:*:cursor-pointer">
                <Link href={'/login'}>
                  <Button>
                    {LOGIN_ICON}
                    Sign In
                  </Button>
                </Link>

                <Link href={'/create-account'}>
                  <Button>
                    {CREATE_ACCOUNT_ICON}
                    Create Account
                  </Button>
                </Link>
              </div>

              <div className="space-y-3 mt-6">
                <h2 className="text-muted-foreground">Change Currency</h2>
                <CurrencySelector />
              </div>
            </motion.div>
          </DialogContent>
        </AnimatePresence>
      </Dialog>
    )
  }

  return (
    <div className="rounded-xl ring-2 p-2 size-8 flex items-center justify-center ring-primary">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger>
              <RiUserLine />
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Click to view account options</TooltipContent>
        </Tooltip>
        <AnimatePresence>
          <DropdownMenuContent className="mx-2 mt-2 md:mx-0 md:mt-1" forceMount asChild>
            <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="hidden" transition={dropdownTransition}>
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link href={'/account'} className="w-full">
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={'/orders'} className="w-full">
                    Order
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={'/account/addresses'} className="w-full">
                    Addresses
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <HoverCard>
                    <HoverCardTrigger className="text-foreground/50 cursor-not-allowed flex items-center gap-2">
                      <RiHeart2Line />
                      Wishlist
                    </HoverCardTrigger>
                    <HoverCardContent className="relative">
                      <p className="text-sm text-foreground/50">
                        Wishlist is coming soon! You will be able to save your favorite products and view them later.
                      </p>
                      <span className="sr-only">Wishlist is coming soon! You will be able to save your favorite products and view them later.</span>
                    </HoverCardContent>
                  </HoverCard>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Select Currency</DropdownMenuLabel>
                <DropdownMenuItem className="p-0!">
                  <CurrencySelector />
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Link href={'/logout'} className="flex items-center w-full gap-1 uppercase text-destructive font-medium">
                    <RiLogoutBoxRLine /> Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </motion.div>
          </DropdownMenuContent>
        </AnimatePresence>
      </DropdownMenu>
    </div>
  )
}
