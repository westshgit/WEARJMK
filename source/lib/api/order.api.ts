import { cache } from 'react'
import type { User, Order, OrdersSelect, Transaction } from '@/payload-types'
import type { Where } from 'payload'
import { getPayloadAPI } from './shared'

type Payload = Awaited<ReturnType<typeof getPayloadAPI>>
type FindOrdersOptions = Parameters<Payload['find']>[0]

type GetOrdersForUserArgs = {
  user: User
  where?: Where
  select?: OrdersSelect<false> | OrdersSelect<true>
} & Partial<Omit<FindOrdersOptions, 'collection' | 'where' | 'user' | 'overrideAccess' | 'select'>>

async function restoreMissingOrderAmounts(payload: Payload, orders: Order[]): Promise<Order[]> {
  return Promise.all(
    orders.map(async (order) => {
      if (typeof order.amount === 'number' && order.amount > 0) return order

      const transactionResult = await payload.find({
        collection: 'transactions',
        limit: 1,
        overrideAccess: true,
        select: {
          amount: true,
          currency: true,
        },
        sort: '-createdAt',
        where: {
          and: [
            { order: { equals: order.id } },
            { status: { equals: 'succeeded' } },
            { amount: { greater_than: 0 } },
          ],
        },
      })

      const transaction = transactionResult.docs[0] as Transaction | undefined
      if (!transaction?.amount) return order

      return {
        ...order,
        amount: transaction.amount,
        currency: transaction.currency ?? order.currency,
      }
    }),
  )
}

export const getOrdersForUser = cache(async ({ user, where, select, limit = 5, pagination = false, ...rest }: GetOrdersForUserArgs): Promise<Order[]> => {
  const payload = await getPayloadAPI()

  const ordersResult = await payload.find({
    collection: 'orders',
    limit,
    pagination,
    overrideAccess: false,
    user,
    select,
    ...rest,
    where: {
      and: [{ customer: { equals: user.id } }, ...(where ? [where] : [])],
    },
  })

  return restoreMissingOrderAmounts(payload, (ordersResult.docs as Order[]) || [])
})
