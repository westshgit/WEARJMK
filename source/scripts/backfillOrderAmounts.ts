import config from '@payload-config'
import { getPayload } from 'payload'

import type { Order, Transaction } from '@/payload-types'

async function backfillOrderAmounts(): Promise<void> {
  const payload = await getPayload({ config })
  const ordersResult = await payload.find({
    collection: 'orders',
    depth: 0,
    overrideAccess: true,
    pagination: false,
    where: {
      or: [{ amount: { less_than_equal: 0 } }, { amount: { exists: false } }],
    },
  })

  let repaired = 0
  let skipped = 0

  for (const order of ordersResult.docs as Order[]) {
    const transactionIDs =
      order.transactions?.map((transaction) => (typeof transaction === 'object' ? transaction.id : transaction)) ?? []

    const transactionResult = await payload.find({
      collection: 'transactions',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      sort: '-createdAt',
      where: {
        and: [
          {
            or: [
              { order: { equals: order.id } },
              ...(transactionIDs.length > 0 ? [{ id: { in: transactionIDs } }] : []),
            ],
          },
          { status: { equals: 'succeeded' } },
          { amount: { greater_than: 0 } },
        ],
      },
    })

    const transaction = transactionResult.docs[0] as Transaction | undefined
    if (!transaction?.amount || !transaction.currency) {
      skipped += 1
      continue
    }

    await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        amount: transaction.amount,
        currency: transaction.currency,
      },
      overrideAccess: true,
    })
    repaired += 1
  }

  payload.logger.info({
    msg: 'Finished repairing order amounts',
    repaired,
    skipped,
  })
}

await backfillOrderAmounts()
