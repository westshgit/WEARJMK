import { cache } from 'react'
import type { Order, OrdersSelect } from '@/payload-types'
import { getPayloadAPI } from './shared'
import { BasePayload } from 'payload'

type FindOrdersOptions = Parameters<BasePayload['find']>[0]

type _GetOrdersForUserArgs = Omit<FindOrdersOptions, 'select'> & {
  select?: OrdersSelect<false> | OrdersSelect<true>
}

type GetOrdersForUserArgs = Partial<Omit<_GetOrdersForUserArgs, 'collection' | 'overrideAccess'>>

export const getOrdersForUser = cache(async ({ select, ...rest }: GetOrdersForUserArgs): Promise<Order[]> => {
  const payload = await getPayloadAPI()

  try {
    const findArgs = {
      collection: 'orders',
      overrideAccess: false,
      ...(select ? { select } : {}),
      ...rest,
    } as _GetOrdersForUserArgs

    const { docs } = await payload.find(findArgs)

    return docs as Order[]
  } catch (error) {
    console.error('Error fetching orders for user:', error)
    return []
  }
})

// const { id } = await params
// const { email = '', accessToken = '' } = await searchParams

// let order: Order | null = null

// // TODO:
// // remove this api to the lib/api/order.api.ts file and import it here
// try {
//   const {
//     docs: [orderResult],
//   } = await payload.find({
//     collection: 'orders',
//     user,
//     overrideAccess: !Boolean(user),
//     depth: 3,
//     where: {
//       and: [
//         {
//           id: {
//             equals: id,
//           },
//         },
//         ...(user
//           ? [
//               {
//                 customer: {
//                   equals: user.id,
//                 },
//               },
//             ]
//           : [
//               {
//                 accessToken: {
//                   equals: accessToken,
//                 },
//               },
//               ...(email
//                 ? [
//                     {
//                       customerEmail: {
//                         equals: email,
//                       },
//                     },
//                   ]
//                 : []),
//             ]),
//       ],
//     },
//     select: {

//     },
//   })

//   const canAccessAsGuest = !user && Boolean(accessToken) && Boolean(orderResult)
//   const canAccessAsUser =
//     user && orderResult && orderResult.customer && (typeof orderResult.customer === 'object' ? orderResult.customer.id : orderResult.customer) === user.id

//   if (orderResult && (canAccessAsGuest || canAccessAsUser)) {
//     order = orderResult

//     if (typeof order.amount !== 'number' || order.amount <= 0) {
//       const transactionResult = await payload.find({
//         collection: 'transactions',
//         limit: 1,
//         overrideAccess: true,
//         select: {
//           amount: true,
//           currency: true,
//         },
//         sort: '-createdAt',
//         where: {
//           and: [{ order: { equals: order.id } }, { status: { equals: 'succeeded' } }, { amount: { greater_than: 0 } }],
//         },
//       })
//       const transaction = transactionResult.docs[0] as Transaction | undefined

//       if (transaction?.amount) {
//         order = {
//           ...order,
//           amount: transaction.amount,
//           currency: transaction.currency ?? order.currency,
//         }
//       }
//     }
//   }
// } catch (error) {
//   console.error(error)
// }

// console.dir(order, { depth: 5 })

// if (!order) {
//   notFound()
// }
