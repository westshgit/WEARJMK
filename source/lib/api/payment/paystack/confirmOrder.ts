import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

import { verifyPaystackPayment } from './verifyPayment'

type Props = {
  apiBase: string
  requestTimeoutMs: number
  secretKey: string
}

export const confirmOrder =
  ({ apiBase, requestTimeoutMs, secretKey }: Props): NonNullable<PaymentAdapter['confirmOrder']> =>
  async ({ data, req, transactionsSlug = 'transactions' }) => {
    const reference = typeof data.reference === 'string' ? data.reference.trim() : ''

    if (!reference) {
      throw new Error('Paystack transaction reference is required.')
    }

    try {
      const fulfillment = await verifyPaystackPayment({
        apiBase,
        customerEmail: data.customerEmail,
        decrementInventory: false,
        reference,
        req,
        requestTimeoutMs,
        secretKey,
        transactionsSlug,
      })

      return {
        ...('accessToken' in fulfillment.order && fulfillment.order.accessToken ? { accessToken: fulfillment.order.accessToken } : {}),
        message: fulfillment.created ? 'Payment confirmed successfully.' : 'Order already confirmed.',
        orderID: fulfillment.order.id,
        transactionID: fulfillment.transaction.id,
      }
    } catch (error) {
      req.payload.logger.error({
        err: error,
        msg: 'Error confirming order with Paystack',
      })

      throw new Error(error instanceof Error ? error.message : 'Unable to confirm payment with Paystack.')
    }
  }
