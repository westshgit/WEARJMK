'use client'
import type { Product, Variant } from '@/payload-types'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Media } from '@/components/Media'
import { Button } from '../ui/button'
import { Eye, Heart, ShoppingBag, X } from 'lucide-react'
import { Price } from '../Price'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { motion, Variants } from 'motion/react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

type Props = {
  product: Partial<Product>
  linkClassName?: string
  mediaClassName?: string
  imgClassName?: string
}

const contentVariants = {
  closed: {},
  open: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
} as Variants

const itemVariants = {
  closed: { opacity: 0, y: 6 },
  open: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
} as Variants

export const ProductGridItem: React.FC<Props> = ({ product, linkClassName, mediaClassName, imgClassName }) => {
  const [open, setOpen] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const { gallery, priceInUSD, title } = product

  let price = priceInUSD

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (variant && typeof variant === 'object' && variant?.priceInUSD && typeof variant.priceInUSD === 'number') {
      price = variant.priceInUSD
    }
  }

  const variantDocs = product.variants?.docs
  if (variantDocs && variantDocs.length > 0) {
    const variant = variantDocs[0]
    if (variant && typeof variant === 'object' && typeof variant.priceInUSD === 'number') {
      price = variant.priceInUSD
    }
  }

  // Adjust this once you confirm the Variant shape — assuming each variant
  // resolves to a size label via `variant.title` (e.g. "S", "M", "L").
  const sizes = useMemo(() => {
    if (!variantDocs) return []
    return variantDocs
      .filter((v): v is Variant => typeof v === 'object')
      .map((v) => v.title)
      .filter((t): t is string => Boolean(t))
  }, [variantDocs])

  const image = gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : false

  return (
    <div className="relative overflow-hidden">
      <Link className={clsx('relative inline-block h-full w-full group', linkClassName)} href={`/products/${product.slug}`}>
        {image ? (
          <Media
            className={clsx('relative aspect-square object-cover border rounded-2xl p-8 bg-primary-foreground', mediaClassName)}
            height={80}
            imgClassName={clsx(
              'h-full w-full object-cover rounded-2xl',
              {
                'transition duration-300 ease-in-out group-hover:scale-102': true,
              },
              imgClassName,
            )}
            resource={image}
            width={80}
          />
        ) : null}
      </Link>

      <div className="absolute bottom-4 inset-x-0 rounded-[20px] flex flex-col gap-1">
        <div className="flex items-center justify-end pr-2">
          <Dialog>
            <DialogTrigger asChild className="w-fit">
              <Button variant={'outline'}>
                <Eye className="size-5 text-foreground" />
              </Button>
            </DialogTrigger>

            <DialogContent className="flex h-[90vh] w-[95vw] flex-col overflow-hidden border-none bg-transparent p-0 sm:h-[92vh]" showCloseButton={false}>
              {/* pinned layer — outside the scroll region so it never moves */}
              <DialogClose asChild>
                <div className="flex items-center justify-end">
                  <Button className="uppercase">
                    <X className="size-5 font-black" />
                  </Button>
                </div>
              </DialogClose>

              {/* scrolling layer — image + card, natural height, scrolls only if it overflows */}
              <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto">
                {image ? (
                  <Media
                    className="max-h-[65vh] w-auto max-w-full flex-none"
                    imgClassName={clsx('max-h-[65vh] w-auto max-w-full rounded-2xl object-contain', imgClassName)}
                    resource={image}
                  />
                ) : null}

                <ProductDetailsCard
                  className="w-full flex-none bg-secondary text-secondary-foreground"
                  title={title}
                  price={price}
                  sizes={sizes}
                  selectedSize={selectedSize}
                  setSelectedSize={setSelectedSize}
                  wishlisted={wishlisted}
                  setWishlisted={setWishlisted}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center justify-end pr-2">
              <Button variant={'outline'}>
                {typeof price === 'number' && (
                  <div className="flex items-center">
                    <ShoppingBag className="size-4" />
                    <Price
                      amount={price}
                      className="flex-none font-mono text-foreground font-black p-2 text-xs"
                      currencyCodeClassName="hidden @[275px]/label:inline"
                    />
                  </div>
                )}
              </Button>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 p-0 overflow-hidden" align="end">
            <ProductDetailsCard
              title={title}
              price={price}
              sizes={sizes}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              wishlisted={wishlisted}
              setWishlisted={setWishlisted}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function ProductDetailsCard({
  title,
  price,
  sizes,
  selectedSize,
  setSelectedSize,
  wishlisted,
  setWishlisted,
  className,
}: {
  className?: string
  title: string | undefined
  price: number | undefined | null
  sizes: string[]
  selectedSize: string | null
  setSelectedSize: (size: string) => void
  wishlisted: boolean
  setWishlisted: (value: boolean) => void
}) {
  return (
    <motion.div initial="closed" animate="open" variants={contentVariants} className={clsx('flex flex-col gap-3 p-3', className)}>
      {/* title + wishlist */}
      <motion.div variants={itemVariants} className="flex items-start justify-between gap-2">
        <h4 className="font-mono text-base leading-snug text-foreground">{title}</h4>
        <Button variant={'outline'} onClick={() => setWishlisted((v) => !v)} aria-label="Add to wishlist">
          <Heart className={clsx('size-4 transition-colors', wishlisted ? 'fill-foreground text-foreground' : 'text-muted-foreground')} />
        </Button>
      </motion.div>

      {/* price */}
      <motion.div variants={itemVariants}>{typeof price === 'number' && <Price amount={price} className="font-mono text-sm text-foreground" />}</motion.div>

      {/* size picker, only if the product actually has sizes */}
      {sizes.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-1.5">
          {sizes.map((size) => (
            <Button key={size} variant={'default'} onClick={() => setSelectedSize(size)}>
              {size}
            </Button>
          ))}
        </motion.div>
      )}

      {/* add to bag */}
      <motion.div variants={itemVariants}>
        <Button
          className="w-full uppercase"
          size="sm"
          disabled={sizes.length > 0 && !selectedSize}
          onClick={() => {
            // wire up cart mutation here — have selectedSize + product available
          }}
        >
          <ShoppingBag className="size-4" />
          Add to Bag
        </Button>
      </motion.div>
    </motion.div>
  )
}
