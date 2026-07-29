import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utilities/formatDateTime'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeftIcon } from 'lucide-react'
import { ProductItem } from '@/components/ProductItem'
import { OrderStatus } from '@/components/OrderStatus'
import { AddressItem } from '@/components/addresses/AddressItem'
import { getUserServer } from '@/lib/api'
import { getOrdersAPI } from '@/lib/api/order.api'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string; accessToken?: string }>
}

export default async function Order({ params, searchParams }: PageProps) {
  const { id } = await params
  const { email = '', accessToken = '' } = await searchParams

  const { user } = await getUserServer()
  const orders = await getOrdersAPI({
    user,
    depth: 2,
    where: {
      and: [
        {
          id: {
            equals: id,
          },
        },
      ],
      ...(user ? { customer: { equals: user?.id } } : { accessToken: { equals: accessToken }, ...(email ? { customerEmail: { equals: email } } : {}) }),
    },
    select: {
      amount: true,
      currency: true,
      items: {
        product: true,
        variant: true,
        quantity: true,
        id: true,
      },
      customerEmail: true,
      transactions: true,
      customer: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      shippingAddress: true,
    },
  })

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return notFound()
  }

  const firstOrder = orders[0]

  const canAccessAsGuest = !user && email && accessToken && firstOrder && firstOrder.customerEmail && firstOrder.customerEmail === email
  const canAccessAsUser =
    user && firstOrder && firstOrder.customer && (typeof firstOrder.customer === 'object' ? firstOrder.customer.id : firstOrder.customer) === user.id

  if (!canAccessAsGuest && !canAccessAsUser) {
    return notFound()
  }

  return (
    <div className="">
      <div className="flex gap-8 justify-between items-center mb-6">
        {user ? (
          <div className="flex gap-4">
            <Button asChild variant="ghost" className="uppercase font-mono text-xl">
              <Link href="/orders">
                <ChevronLeftIcon />
                All orders
              </Link>
            </Button>
          </div>
        ) : (
          <div></div>
        )}

        <h1 className="text-sm uppercase font-mono px-2 bg-primary/10 rounded tracking-[0.07em]">
          <span className="">{`Order #${firstOrder.id}`}</span>
        </h1>
      </div>

      <div className="bg-card border rounded-lg px-6 py-4 flex flex-col gap-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="">
            <p className="font-mono uppercase text-primary/50 mb-1 text-sm">Order Date</p>
            <p className="text-lg">
              <time dateTime={firstOrder.createdAt}>{formatDateTime({ date: firstOrder.createdAt, format: 'MMMM dd, yyyy' })}</time>
            </p>
          </div>

          <div className="">
            <p className="font-mono uppercase text-primary/50 mb-1 text-sm">Total</p>
            {typeof firstOrder.amount === 'number' && firstOrder.amount > 0 ? (
              <Price className="text-lg" amount={firstOrder.amount} currencyCode={firstOrder.currency ?? undefined} />
            ) : (
              <p className="text-sm text-muted-foreground">Amount unavailable</p>
            )}
          </div>

          {firstOrder.status && (
            <div className="grow max-w-1/3">
              <p className="font-mono uppercase text-primary/50 mb-1 text-sm">Status</p>
              <OrderStatus className="text-sm" status={firstOrder.status} />
            </div>
          )}
        </div>

        {firstOrder.items && (
          <div>
            <h2 className="font-mono text-primary/50 mb-4 uppercase text-sm">Items</h2>
            <ul className="flex flex-col gap-6">
              {firstOrder.items?.map((item, index) => {
                if (typeof item.product === 'string') {
                  return null
                }

                if (!item.product || typeof item.product !== 'object') {
                  return <div key={index}>This item is no longer available.</div>
                }

                const variant = item.variant && typeof item.variant === 'object' ? item.variant : undefined

                return (
                  <li key={item.id}>
                    <ProductItem product={item.product} quantity={item.quantity} variant={variant} />
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {firstOrder.shippingAddress && (
          <div>
            <h2 className="font-mono text-primary/50 mb-4 uppercase text-sm">Shipping Address</h2>
            {/* @ts-expect-error - some kind of type hell */}
            <AddressItem address={firstOrder.shippingAddress} hideActions />
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  return {
    description: `Order details for order ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Order ${id}`,
      url: `/orders/${id}`,
    }),
    title: `Order ${id}`,
  }
}
