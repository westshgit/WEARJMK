import type { Endpoint, PayloadRequest } from 'payload'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

import { confirmPaystackOrder } from '../confirmOrder'
import type { PaystackWebhookEvent, PaystackWebhookHandlers } from '../types'

type Props = {
  apiBase: string
  requestTimeoutMs: number
  secretKey: string
  webhooks?: PaystackWebhookHandlers
}

const webhookEventSchema: z.ZodType<PaystackWebhookEvent> = z.object({
  event: z.string().min(1),
  data: z
    .object({
      amount: z.number().int().nonnegative().optional(),
      currency: z.string().min(1).optional(),
      customer: z
        .object({
          customer_code: z.string().min(1).optional(),
          email: z.email(),
          id: z.number().int(),
        })
        .optional(),
      domain: z.string().optional(),
      id: z.number().int().optional(),
      metadata: z.union([z.record(z.string(), z.unknown()), z.string(), z.null()]).optional(),
      reference: z.string().trim().min(1).max(200),
      status: z.string().optional(),
    })
    .loose(),
})

function verifyPaystackSignature({ body, secretKey, signature }: { body: string; secretKey: string; signature: string | null }) {
  if (!signature || !/^[a-f\d]{128}$/i.test(signature)) {
    return false
  }

  const expectedSignature = createHmac('sha512', secretKey).update(body).digest('hex')
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
  const signatureBuffer = Buffer.from(signature.toLowerCase(), 'utf8')

  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer)
}

export const webhooksEndpoint = ({ apiBase, requestTimeoutMs, secretKey, webhooks }: Props): Endpoint => {
  const handler = async (req: PayloadRequest): Promise<Response> => {
    const rawBody = (await req.text?.()) ?? ''
    const signature = req.headers.get('x-paystack-signature')

    if (!verifyPaystackSignature({ body: rawBody, secretKey, signature })) {
      req.payload.logger.warn('Rejected Paystack webhook with an invalid signature.')
      return Response.json({ error: 'Invalid Paystack signature.' }, { status: 401 })
    }

    let body: unknown

    try {
      body = JSON.parse(rawBody) as unknown
    } catch {
      return Response.json({ error: 'Invalid Paystack webhook payload.' }, { status: 400 })
    }

    const parsedEvent = webhookEventSchema.safeParse(body)

    if (!parsedEvent.success) {
      req.payload.logger.warn({
        issues: parsedEvent.error.issues,
        msg: 'Rejected invalid Paystack webhook payload.',
      })
      return Response.json({ error: 'Invalid Paystack webhook payload.' }, { status: 400 })
    }

    const event = parsedEvent.data

    try {
      if (event.event === 'charge.success') {
        await confirmPaystackOrder({
          apiBase,
          reference: event.data.reference,
          req,
          requestTimeoutMs,
          secretKey,
        })
      }

      await webhooks?.[event.event]?.({ event, req })

      return Response.json({ received: true })
    } catch (error) {
      req.payload.logger.error({
        err: error,
        event: event.event,
        msg: 'Unable to process Paystack webhook.',
        reference: event.data.reference,
      })

      return Response.json({ error: 'Unable to process Paystack webhook.' }, { status: 500 })
    }
  }

  return {
    handler,
    method: 'post',
    path: '/webhooks',
  }
}
