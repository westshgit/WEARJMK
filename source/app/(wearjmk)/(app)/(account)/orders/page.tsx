import type { Order } from '@/payload-types'
import type { Metadata } from 'next'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { OrderItem } from '@/components/OrderItem'
import { redirect } from 'next/navigation'
import { getUserServer } from '@/lib/api/user.api'
import Condition from '@/components/Condition'
import { getOrdersAPI } from '@/lib/api/order.api'

export default async function Orders() {
  const { user } = await getUserServer()

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your orders.')}`)
  }

  const orders: Order[] = await getOrdersAPI({ user, pagination: false, limit: 0, where: { customer: { equals: user?.id } } })

  return (
    <div className="border p-8 rounded-lg bg-primary-foreground w-full">
      <h1 className="text-3xl font-medium mb-8 uppercase">Orders</h1>
      {(!orders || !Array.isArray(orders) || orders?.length === 0) && <p className="">You have no orders.</p>}

      <Condition predicate={Boolean(orders && Array.isArray(orders) && orders.length > 0)}>
        <ul className="flex flex-col gap-6 max-h-[50vh] overflow-auto no-scrollbar">
          {orders?.map((order) => (
            <li key={order.id}>
              <OrderItem order={order} />
            </li>
          ))}
        </ul>
      </Condition>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Your orders.',
  openGraph: mergeOpenGraph({
    title: 'Orders',
    url: '/orders',
  }),
  title: 'Orders',
}
