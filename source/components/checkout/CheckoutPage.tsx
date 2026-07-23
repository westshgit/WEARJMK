'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { useTheme } from '@wrksz/themes/client'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { cssVariables } from '@/cssVariables'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { useAddresses, useCart, useCurrency, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { Address, PolicyBlock, Product, User, Variant } from '@/payload-types'
import { AddressItem } from '@/components/addresses/AddressItem'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { getPriceWithCurrencyCode } from '@/utilities'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty'
import { ArrowRight, CreditCard, LogIn, Mail, Store, UserPlus } from 'lucide-react'
import { RiHandbagLine } from '@remixicon/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import Condition from '@/components/Condition'
import { Wizard } from 'react-use-wizard'
import { AnimatedWizardWrapper, GuestAddressStep, GuestContactStep, GuestReviewStep } from './Step'
import { RenderBlocks } from '@/blocks/RenderBlocks'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)

const maskEmail = (email: string) => {
  const [name, domain] = email.split('@')
  if (!name || !domain) return email
  const maskedName = name.length <= 2 ? name[0] + '*' : name.slice(0, 2) + '*'.repeat(name.length - 2)
  return `${maskedName}@${domain}`
}

export const CheckoutPage: React.FC<{ user?: User; policyBlock: PolicyBlock | undefined }> = ({ user, policyBlock }) => {
  const router = useRouter()
  const { cart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const { theme } = useTheme()
  /**
   * State to manage the email input for guest checkout.
   */
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [paymentData, setPaymentData] = useState<null | Record<string, unknown>>(null)
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  const canGoToPayment = Boolean((email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress))

  const { currency } = useCurrency()

  // On initial load wait for addresses to be loaded and check to see if we can prefill a default one
  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const initiatePaymentIntent = useCallback(
    async (paymentID: string) => {
      try {
        const paymentData = (await initiatePayment(paymentID, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            billingAddress,
            shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
          },
        })) as Record<string, unknown>

        if (paymentData) {
          setPaymentData(paymentData)
        }
      } catch (error) {
        console.log(error)
        const errorData = error instanceof Error ? JSON.parse(error.message) : {}
        let errorMessage = 'An error occurred while initiating payment.'

        if (errorData?.cause?.code === 'OutOfStock') {
          errorMessage = 'One or more items in your cart are out of stock.'
        }

        setError(errorMessage)
        toast.error(errorMessage)
      }
    },
    [billingAddress, billingAddressSameAsShipping, shippingAddress],
  )

  if (!stripe) return null

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-12 w-full items-center justify-center">
        <div className="prose dark:prose-invert text-center max-w-none self-center mb-8">
          <p>Processing your payment...</p>
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
            <Wizard wrapper={<AnimatedWizardWrapper />}>
              <GuestContactStep email={email} setEmail={setEmail} emailEditable={emailEditable} setEmailEditable={setEmailEditable} />
              <GuestAddressStep email={email} billingAddress={billingAddress} setBillingAddress={setBillingAddress} />
              <GuestReviewStep email={email} billingAddress={billingAddress} />
            </Wizard>

            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="font-medium text-xl uppercase">JSYK</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  You can log in or create an account to save your favorites, manage your orders, and enjoy a faster checkout.
                </p>
              </div>

              <div className="w-full flex gap-2 *:basis-full *:*:w-full max-w-md *:*:cursor-pointer">
                <Link href={'/login'}>
                  <Button variant={'outline'} className="uppercase gap-2">
                    <LogIn className="size-4 shrink-0" />
                    Sign In
                  </Button>
                </Link>

                <Link href={'/create-account'}>
                  <Button variant={'outline'} className="uppercase gap-2">
                    <UserPlus className="size-4 shrink-0" />
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </Condition>
          <Condition predicate={Boolean(user)}>
            <Card className="md:max-w-md!">
              <CardHeader>
                <CardTitle className="uppercase text-2xl">Hey {user?.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0" />
                  {user?.email ? maskEmail(user.email) : null}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {billingAddress ? (
                  <AddressItem
                    actions={
                      <Button
                        className="uppercase"
                        variant={'destructive'}
                        disabled={Boolean(paymentData)}
                        onClick={(e) => {
                          e.preventDefault()
                          setBillingAddress(undefined)
                        }}
                      >
                        Remove
                      </Button>
                    }
                    address={billingAddress}
                  />
                ) : (
                  <CheckoutAddresses heading="Billing address" description="Please select a billing address." setAddress={setBillingAddress} />
                )}
              </CardContent>
            </Card>
          </Condition>
          {!paymentData && (
            <AnimatePresence>
              {!paymentData && (
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
                    disabled={!canGoToPayment}
                    onClick={(e) => {
                      e.preventDefault()
                      void initiatePaymentIntent('paystack')
                    }}
                  >
                    <span className="flex items-center gap-2 tracking-tighter">
                      <CreditCard className="size-8 shrink-0 text-muted-foreground" />
                      Go to payment
                    </span>
                    <ArrowRight className="size-4 shrink-0" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {!paymentData?.['clientSecret'] && error && (
            <div className="my-8">
              <Message error={error} />

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

          <Suspense fallback={<React.Fragment />}>
            {/* @ts-ignore */}
            {paymentData && paymentData?.['clientSecret'] && (
              <div className="pb-16">
                <h2 className="font-medium text-3xl">Payment</h2>
                {error && <p>{`Error: ${error}`}</p>}
                <Elements
                  options={{
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        borderRadius: '6px',
                        colorPrimary: '#858585',
                        gridColumnSpacing: '20px',
                        gridRowSpacing: '20px',
                        colorBackground: theme === 'dark' ? '#0a0a0a' : cssVariables.colors.base0,
                        colorDanger: cssVariables.colors.error500,
                        colorDangerText: cssVariables.colors.error500,
                        colorIcon: theme === 'dark' ? cssVariables.colors.base0 : cssVariables.colors.base1000,
                        colorText: theme === 'dark' ? '#858585' : cssVariables.colors.base1000,
                        colorTextPlaceholder: '#858585',
                        fontFamily: 'Geist, sans-serif',
                        fontSizeBase: '16px',
                        fontWeightBold: '600',
                        fontWeightNormal: '500',
                        spacingUnit: '4px',
                      },
                    },
                    clientSecret: paymentData['clientSecret'] as string,
                  }}
                  stripe={stripe}
                >
                  <div className="flex flex-col gap-8">
                    <CheckoutForm customerEmail={email} billingAddress={billingAddress} setProcessingPayment={setProcessingPayment} />
                    <Button variant="ghost" className="self-start" onClick={() => setPaymentData(null)}>
                      Cancel payment
                    </Button>
                  </div>
                </Elements>
              </div>
            )}
          </Suspense>
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
