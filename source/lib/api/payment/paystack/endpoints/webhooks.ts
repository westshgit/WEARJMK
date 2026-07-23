import crypto from 'crypto'
import type { Endpoint, PayloadRequest } from 'payload'

import type { PaystackWebhookEvent, PaystackWebhookHandlers } from '../types'

type Props = {
  secretKey: string
  webhooks?: PaystackWebhookHandlers
}

/**
 * Verify that a webhook request was genuinely sent by Paystack.
 *
 * Unlike Stripe (separate `whsec_...` secret + `constructEvent` helper),
 * Paystack signs the **entire raw request body** with **HMAC-SHA512** keyed on
 * the **secret key itself**, and sends the hex digest in the
 * `x-paystack-signature` header. There is no SDK helper — we compute the
 * digest ourselves and compare with `timingSafeEqual` to avoid timing attacks.
 *
 * @see https://paystack.com/docs/payments/webhooks/
 */
const isAuthenticPaystackRequest = (rawBody: string, signatureHeader: string | null, secretKey: string): boolean => {
  if (!signatureHeader) return false

  const digest = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex')

  // Guard against mismatched lengths before the constant-time compare.
  if (digest.length !== signatureHeader.length) return false

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader))
  } catch {
    return false
  }
}

/**
 * The Paystack webhook receiver. Bootstrapped by the ecommerce plugin at
 * `POST /api/payments/paystack/webhooks`.
 *
 * The endpoint MUST respond `200` quickly — Paystack retries on any non-200.
 * Heavier work (order creation etc.) should be delegated to the registered
 * webhook handlers or a background job.
 */
export const webhooksEndpoint = (props: Props): Endpoint => {
  const { secretKey, webhooks } = props || {}

  const handler = async (req: PayloadRequest): Promise<Response> => {
    let returnStatus = 200

    // `req.text` is available on Payload's request object and yields the raw
    // body — critical because the signature covers the exact bytes received.
    if (secretKey && typeof req.text === 'function') {
      const body = await req.text()
      const signature = req.headers.get('x-paystack-signature')

      if (isAuthenticPaystackRequest(body, signature, secretKey)) {
        const event = JSON.parse(body) as PaystackWebhookEvent

        // Dispatch to the user-registered handler for this event type, e.g.
        // `charge.success`, `charge.failed`, `transfer.success`.
        if (webhooks && typeof webhooks[event.event] === 'function') {
          await webhooks[event.event]({ event, req })
        }
      } else {
        req.payload.logger.error('Invalid Paystack webhook signature')
        returnStatus = 401
      }
    }

    return Response.json({ received: true }, { status: returnStatus })
  }

  return {
    handler,
    method: 'post',
    path: '/webhooks',
  }
}
