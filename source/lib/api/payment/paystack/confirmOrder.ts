import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import type { DefaultDocumentIDType } from 'payload'

import { createPaystackClient } from './client'
import { fulfillPaystackOrder, markPaystackTransactionFailed } from './fulfillOrder'

type Props = {
  apiBase: string
  requestTimeoutMs: number
  secretKey: string
}

type PaystackConfirmResponse = {
  accessToken?: string
  message: string
  orderID: DefaultDocumentIDType
}

export const confirmOrder =
  (props: Props): NonNullable<PaymentAdapter>['confirmOrder'] =>
  async ({ cartsSlug = 'carts', data, ordersSlug = 'orders', req, transactionsSlug = 'transactions' }) => {
    const payload = req.payload
    const { secretKey } = props

    const customerEmail = data.customerEmail
    const reference = typeof data.reference === 'string' ? data.reference : undefined

    if (!secretKey) {
      throw new Error('Paystack secret key is required')
    }
    if (!reference) {
      throw new Error('Transaction reference is required')
    }

    const paystack = createPaystackClient({
      apiBase: props.apiBase,
      requestTimeoutMs: props.requestTimeoutMs,
      secretKey,
    })

    try {
      const transactionData = await paystack.verify(reference)

      if (transactionData.status !== 'success') {
        if (['abandoned', 'failed', 'reversed'].includes(transactionData.status)) {
          await markPaystackTransactionFailed({
            reference,
            req,
            transactionsSlug,
          })
        }

        throw new Error(`Payment not completed. Status: ${transactionData.status}`)
      }

      const fulfillment = await fulfillPaystackOrder({
        cartsSlug,
        customerEmail,
        decrementInventory: true,
        ordersSlug,
        req,
        transactionData,
        transactionsSlug,
      })

      const response: PaystackConfirmResponse = {
        message: fulfillment.created ? 'Payment confirmed successfully' : 'Order already confirmed',
        orderID: fulfillment.order.id,
        ...('accessToken' in fulfillment.order && fulfillment.order.accessToken ? { accessToken: fulfillment.order.accessToken } : {}),
      }

      return response as Awaited<ReturnType<NonNullable<PaymentAdapter>['confirmOrder']>>
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: 'Error confirming order with Paystack',
      })
      throw new Error(error instanceof Error ? error.message : 'Unknown error confirming payment')
    }
  }
