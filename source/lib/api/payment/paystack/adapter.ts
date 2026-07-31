import { Env } from '@/lib/env'

import { paystackAdapter as createPaystackAdapter } from '@/lib/api/payment/paystack'

export const paystackAdapter = createPaystackAdapter({
  apiBase: Env.PAYSTACK_API_BASE_URL,
  callbackUrl: new URL('/checkout/confirm-order', Env.NEXT_PUBLIC_SERVER_URL).toString(),
  referencePrefix: Env.PAYSTACK_REFERENCE_PREFIX,
  requestTimeoutMs: Env.PAYSTACK_REQUEST_TIMEOUT_MS,
  secretKey: Env.PAYSTACK_SECRET_KEY,
  webhooks: {
    'charge.success': async ({ event, req }) => {
      req.payload.logger.info(`Paystack charge.success received for reference: ${event.data?.reference}`)
    },
  },
})

export type PaystackAdapter = typeof paystackAdapter
