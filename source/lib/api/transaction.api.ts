'use server'

import { Transaction } from '@/payload-types'
import { getPayloadAPI, syntheticServerRequest } from './shared'

export async function getUserTransactionByCartId(cartId: number, email: string): Promise<Transaction | null> {
  const payload = await getPayloadAPI()
  const req = await syntheticServerRequest()

  // Guard: has this cart already been paid/completed, or does this user
  // already have an active transaction against it?
  const existingTransaction = await payload.find({
    collection: 'transactions',
    where: {
      and: [
        { cart: { equals: cartId } },
        req.user ? { customer: { equals: req.user.id } } : { customerEmail: { equals: email } },
        { status: { in: ['pending', 'succeeded'] } },
      ],
    },
    limit: 1,
    req,
  })

  return existingTransaction.docs[0]
}
