import type { Endpoint, PayloadRequest } from 'payload'

import type { PaystackWebhookHandlers } from '../types'

type Props = {
  apiBase: string
  requestTimeoutMs: number
  secretKey: string
  webhooks?: PaystackWebhookHandlers
}

export const webhooksEndpoint = ({ apiBase, requestTimeoutMs, secretKey, webhooks }: Props): Endpoint => {
  const handler = async (req: PayloadRequest): Promise<Response> => {
    return Response.json({ received: true })
  }

  return {
    handler,
    method: 'post',
    path: '/webhooks',
  }
}
