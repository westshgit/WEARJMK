import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { AccountForm } from '@/components/forms/AccountForm'
import { OrderItem } from '@/components/OrderItem'
import { redirect } from 'next/navigation'
import { getUserServer } from '@/lib/api'
import { getOrdersForUser } from '@/lib/api/order.api'
import Condition from '@/components/Condition'

export default async function AccountPage() {
  const { user } = await getUserServer()
  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your account settings.')}`)
  }

  const orders = await getOrdersForUser({ user })

  return (
    <>
      <div className="border p-8 rounded-lg bg-primary-foreground">
        <h1 className="text-3xl font-medium mb-8 uppercase">Account settings</h1>
        <AccountForm user={user} />
      </div>

      <div className=" border p-8 rounded-lg bg-primary-foreground">
        <h2 className="text-3xl font-medium mb-8 uppercase">Recent Orders</h2>

        <div className="prose dark:prose-invert mb-8">
          <p>
            These are the most recent orders you have placed. Each order is associated with an payment. As you place more orders, they will appear in your
            orders list.
          </p>
        </div>

        {(!orders || !Array.isArray(orders) || orders?.length === 0) && <p className="mb-8">You have no orders.</p>}

        <Condition predicate={Boolean(orders && Array.isArray(orders) && orders.length > 0)}>
          <ul className="flex flex-col gap-6 mb-8">
            {orders?.map((order) => (
              <li key={order.id}>
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        </Condition>

        <Button asChild variant="default">
          <Link href="/orders">View all orders</Link>
        </Button>
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Account',
    url: '/account',
  }),
  title: 'Account',
}
