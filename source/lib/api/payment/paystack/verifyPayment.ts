import type { PayloadRequest } from 'payload'

import { createPaystackClient } from './client'
import { fulfillPaystackOrder, markPaystackTransactionFailed } from './fulfillOrder'

type VerifyPaystackPaymentArgs = {
  apiBase: string
  customerEmail?: string
  decrementInventory: boolean
  reference: string
  req: PayloadRequest
  requestTimeoutMs: number
  secretKey: string
  transactionsSlug?: string
}

const terminalFailureStatuses = new Set(['abandoned', 'failed', 'reversed'])

export async function verifyPaystackPayment({
  apiBase,
  customerEmail,
  decrementInventory,
  reference,
  req,
  requestTimeoutMs,
  secretKey,
  transactionsSlug = 'transactions',
}: VerifyPaystackPaymentArgs) {
  const transactionData = await createPaystackClient({
    apiBase,
    requestTimeoutMs,
    secretKey,
  }).verify(reference)

  if (transactionData.status !== 'success') {
    if (terminalFailureStatuses.has(transactionData.status)) {
      await markPaystackTransactionFailed({
        reference,
        req,
        transactionsSlug,
      })
    }

    throw new Error(`Payment has not completed. Paystack status: ${transactionData.status}.`)
  }

  return fulfillPaystackOrder({
    customerEmail,
    decrementInventory,
    req,
    transactionData,
    transactionsSlug,
  })
}
