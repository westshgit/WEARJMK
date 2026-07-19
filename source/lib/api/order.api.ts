import { cache } from 'react'
import type { User, Order, OrdersSelect } from '@/payload-types'
import type { Where } from 'payload'
import { getPayloadAPI } from './shared'

type Payload = Awaited<ReturnType<typeof getPayloadAPI>>
type FindOrdersOptions = Parameters<Payload['find']>[0]

type GetOrdersForUserArgs = {
  user: User
  where?: Where
  select?: OrdersSelect<false> | OrdersSelect<true>
} & Partial<Omit<FindOrdersOptions, 'collection' | 'where' | 'user' | 'overrideAccess' | 'select'>>

export const getOrdersForUser = cache(async ({ user, where, select, limit = 5, pagination = false, ...rest }: GetOrdersForUserArgs): Promise<Order[]> => {
  try {
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
        and: [{ customer: { equals: user?.id } }, ...(where ? [where] : [])],
      },
    })

    return (ordersResult?.docs as Order[]) || []
  } catch (error) {
    return []
  }
})
