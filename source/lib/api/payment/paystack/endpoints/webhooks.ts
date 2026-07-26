import crypto from 'crypto'
import type { Endpoint, PayloadRequest } from 'payload'

import { createPaystackClient } from '../client'
import { fulfillPaystackOrder } from '../fulfillOrder'
import type { PaystackWebhookEvent, PaystackWebhookHandlers } from '../types'

type Props = {
  apiBase: string
  requestTimeoutMs: number
  secretKey: string
  webhooks?: PaystackWebhookHandlers
}

const isAuthenticPaystackRequest = (rawBody: string, signatureHeader: string | null, secretKey: string): boolean => {
  if (!signatureHeader) return false

  const digest = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex')
  if (digest.length !== signatureHeader.length) return false

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader))
  } catch {
    return false
  }
}

export const webhooksEndpoint = ({ apiBase, requestTimeoutMs, secretKey, webhooks }: Props): Endpoint => {
  const handler = async (req: PayloadRequest): Promise<Response> => {
    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature')

    if (!isAuthenticPaystackRequest(body, signature, secretKey)) {
      req.payload.logger.error('Invalid Paystack webhook signature')
      return Response.json({ received: false }, { status: 401 })
    }

    let event: PaystackWebhookEvent
    try {
      event = JSON.parse(body) as PaystackWebhookEvent
    } catch (error) {
      req.payload.logger.error({
        err: error,
        msg: 'Invalid JSON received from Paystack webhook',
      })
      return Response.json({ received: false }, { status: 400 })
    }

    try {
      if (event.event === 'charge.success') {
        if (!event.data?.reference) {
          throw new Error('Paystack webhook is missing a transaction reference')
        }

        const transactionData = await createPaystackClient({
          apiBase,
          requestTimeoutMs,
          secretKey,
        }).verify(event.data.reference)

        await fulfillPaystackOrder({
          decrementInventory: true,
          req,
          transactionData,
        })
      }

      if (webhooks && typeof webhooks[event.event] === 'function') {
        await webhooks[event.event]({ event, req })
      }
    } catch (error) {
      req.payload.logger.error({
        err: error,
        msg: `Failed to process Paystack webhook event: ${event.event}`,
      })

      // Ask Paystack to retry instead of acknowledging a payment we did not persist.
      return Response.json({ received: false }, { status: 503 })
    }

    return Response.json({ received: true })
  }

  return {
    handler,
    method: 'post',
    path: '/webhooks',
  }
}
