'use server'

import { Transaction } from '@/payload-types'
import { getPayloadAPI, syntheticServerRequest } from './shared'
import { ActionResult } from '../shared'

export async function getUserTransactionByCartId(cartId: number, email: string): Promise<Transaction | null> {
  const payload = await getPayloadAPI()

  // Guard: has this cart already been paid/completed, or does this user
  // already have an active transaction against it?
  const existingTransaction = await payload.find({
    collection: 'transactions', // TODO: your actual collection slug
    where: {
      and: [
        { cart: { equals: cartId } },
        { user: { equals: email } }, // TODO: adjust to however you scope transaction -> user
        { status: { in: ['paid', 'completed', 'pending'] } },
      ],
    },
    limit: 1,
    req: await syntheticServerRequest(),
  })

  return existingTransaction.docs[0]
}
