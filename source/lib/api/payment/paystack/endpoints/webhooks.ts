import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Endpoint, PayloadRequest } from 'payload'

import type { PaystackWebhookEvent, PaystackWebhookHandlers } from '../types'
import { verifyPaystackPayment } from '../verifyPayment'

type Props = {
  apiBase: string
  requestTimeoutMs: number
  secretKey: string
  webhooks?: PaystackWebhookHandlers
}

const isAuthenticPaystackRequest = (rawBody: string, signatureHeader: string | null, secretKey: string): boolean => {
  if (!signatureHeader || !/^[\da-f]{128}$/i.test(signatureHeader)) return false

  const digest = createHmac('sha512', secretKey).update(rawBody).digest()
  const signature = Buffer.from(signatureHeader, 'hex')
  if (digest.length !== signature.length) return false

  try {
    return timingSafeEqual(digest, signature)
  } catch {
    return false
  }
}

function isPaystackWebhookEvent(value: unknown): value is PaystackWebhookEvent {
  if (typeof value !== 'object' || value === null) return false

  const event = value as Record<string, unknown>
  const data = event.data

  return (
    typeof event.event === 'string' &&
    typeof data === 'object' &&
    data !== null &&
    typeof (data as Record<string, unknown>).reference === 'string'
  )
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
      const parsedEvent: unknown = JSON.parse(body)
      if (!isPaystackWebhookEvent(parsedEvent)) {
        throw new Error('Webhook event has an invalid shape.')
      }
      event = parsedEvent
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

        await verifyPaystackPayment({
          apiBase,
          decrementInventory: true,
          reference: event.data.reference,
          req,
          requestTimeoutMs,
          secretKey,
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
