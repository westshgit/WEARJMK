'use client'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import React from 'react'
import { useCart, useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { PolicyBlock, Product, User, Variant } from '@/payload-types'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { getPriceWithCurrencyCode } from '@/utilities'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty'
import { ArrowRight, CreditCard, Store } from 'lucide-react'
import { RiHandbagLine } from '@remixicon/react'
import Condition from '@/components/Condition'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { useCheckoutFormState } from './CheckoutFormState'
import LoggedInUserCheckout from './LoggedInUserCheckout'
import GuestUserCheckout from './GuestUserCheckout'

export const CheckoutPage: React.FC<{ user?: User; policyBlock: PolicyBlock | undefined }> = ({ user, policyBlock }) => {
  const router = useRouter()

  const { currency } = useCurrency()
  const { cart } = useCart()

  const formState = useCheckoutFormState({ user, cart })
  const { form, paymentState, cartIsEmpty, canGoToPayment, formIsPending } = formState

  if (cartIsEmpty && formIsPending) {
    return (
      <div className="py-12 w-full items-center justify-center">
        <div className="prose dark:prose-invert text-center max-w-none self-center mb-8">
          <p>Setting up your payment...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <Empty className="min-h-[50vh]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RiHandbagLine />
          </EmptyMedia>
          <EmptyTitle className="uppercase">Your cart is empty</EmptyTitle>
          <EmptyDescription>Your cart is currently empty. Add items to your cart to proceed to checkout.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/shop">
            <Button className="uppercase cursor-pointer" size={'lg'}>
              <Store className="size-4" />
              Continue shopping
            </Button>
          </Link>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="mt-8 mb-32 space-y-36">
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(400px,450px)] gap-20 md:gap-6 lg:gap-8">
        <div className="flex flex-col gap-12 justify-stretch">
          <Condition predicate={!user}>
            <GuestUserCheckout formState={formState} />
          </Condition>
          <Condition predicate={Boolean(user)}>
            <LoggedInUserCheckout formState={formState} user={user as User} />
          </Condition>
          <AnimatePresence>
            <motion.div
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 12,
              }}
            >
              <Button
                variant={'outline'}
                className="self-start text-start uppercase cursor-pointer  h-16 w-full justify-between gap-2 md:max-w-md"
                disabled={!canGoToPayment || formIsPending}
                onClick={(e) => {
                  e.preventDefault()
                  void form.handleSubmit()
                }}
              >
                <span className="flex items-center gap-2 tracking-tighter">
                  <CreditCard className="size-8 shrink-0 text-muted-foreground" />
                  {formIsPending ? 'Preparing payment...' : 'Go to payment'}
                </span>
                <ArrowRight className="size-4 shrink-0" />
              </Button>
            </motion.div>
          </AnimatePresence>

          {!paymentState?.success && paymentState?.formError && (
            <div className="my-8">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  router.refresh()
                }}
                variant="default"
              >
                Try again
              </Button>
            </div>
          )}
        </div>

        {!cartIsEmpty && (
          <div className="p-4 bg-primary/5 flex flex-col gap-8 rounded-lg">
            <h2 className="text-lg font-medium uppercase">Your cart</h2>
            <div className="max-h-[60vh] overflow-auto scrollbar-none [&::-webkit-scrollbar]:hidden flex flex-col gap-4">
              {cart?.items?.map((item, index) => {
                if (typeof item.product === 'object' && item.product) {
                  const {
                    product,
                    product: { id, meta, title, gallery },
                    quantity,
                    variant,
                  } = item as {
                    product: Product
                    variant?: Variant
                    quantity?: number
                    [key: string]: unknown
                  }

                  if (!quantity) return null

                  let image = gallery?.[0]?.image || meta?.image

                  const isVariant = Boolean(variant) && typeof variant === 'object'

                  const price = isVariant
                    ? getPriceWithCurrencyCode(variant as Variant, currency.code)
                    : getPriceWithCurrencyCode(product as Product, currency.code)

                  if (isVariant) {
                    const imageVariant = product.gallery?.find((item) => {
                      if (!item.variantOption) return false
                      const variantOptionID = typeof item.variantOption === 'object' ? item.variantOption.id : item.variantOption

                      const hasMatch = variant?.options?.some((option) => {
                        if (typeof option === 'object') return option.id === variantOptionID
                        else return option === variantOptionID
                      })

                      return hasMatch
                    })

                    if (imageVariant && typeof imageVariant.image !== 'string') {
                      image = imageVariant.image
                    }
                  }

                  return (
                    <div className="flex items-start gap-4" key={index}>
                      <div className="flex items-stretch justify-stretch h-20 w-20 p-1 shadow rounded-lg border">
                        <div className="relative w-full h-full">
                          {image && typeof image !== 'string' && <Media className="" fill imgClassName="aspect-square" resource={image} />}
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1 text-base">
                          <p className="font-medium uppercase">{title}</p>
                          {variant && typeof variant === 'object' && (
                            <p className="font-mono text-primary/50 tracking-widest">
                              {variant.options
                                ?.map((option) => {
                                  if (typeof option === 'object') return option.label
                                  return null
                                })
                                .join(', ')}
                            </p>
                          )}
                          <div>
                            {'x'}
                            {quantity}
                          </div>
                        </div>

                        {typeof price === 'number' && <Price amount={price} className="text-sm" />}
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>
            <hr />
            <div className="flex justify-between items-center gap-2 mt-auto">
              <span className="uppercase font-mono!">Total</span> <Price className="text-base font-medium" amount={cart.subtotal || 0} />
            </div>
          </div>
        )}
      </div>

      <Condition predicate={Boolean(policyBlock) && canGoToPayment}>
        <RenderBlocks blocks={[policyBlock as PolicyBlock]} />
      </Condition>
    </div>
  )
}
