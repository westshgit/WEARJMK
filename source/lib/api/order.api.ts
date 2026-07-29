import { cache } from 'react'
import type { Order, OrdersSelect } from '@/payload-types'
import { getPayloadAPI } from './shared'
import { BasePayload } from 'payload'

type FindOrdersOptions = Parameters<BasePayload['find']>[0]

type _GetOrdersAPIArgs = Omit<FindOrdersOptions, 'select'> & {
  select?: OrdersSelect<false> | OrdersSelect<true>
}

type GetOrdersAPIArgs = Partial<Omit<_GetOrdersAPIArgs, 'collection' | 'overrideAccess'>>

export const getOrdersAPI = cache(async ({ select, ...rest }: GetOrdersAPIArgs): Promise<Order[]> => {
  const payload = await getPayloadAPI()

  try {
    const findArgs = {
      collection: 'orders',
      overrideAccess: false,
      ...(select ? { select } : {}),
      ...rest,
    } as _GetOrdersAPIArgs

    const { docs } = await payload.find(findArgs)

    return docs as Order[]
  } catch (error) {
    console.error('Error fetching orders for user:', error)
    return []
  }
})
