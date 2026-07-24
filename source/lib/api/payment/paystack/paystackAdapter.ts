import 'server-only'
import { Env } from '@/lib/env' 

import { paystackAdapter as createPaystackAdapter } from '@/lib/api/payment/paystack'

export const paystackAdapter = createPaystackAdapter({
  secretKey: Env?.PAYSTACK_SECRET_KEY ?? "",
  webhooks: {
    // Source of truth for a successful charge — process fulfillment
    // asynchronously from here. The webhook URL registered in the
    // Paystack dashboard must point at /api/payments/paystack/webhooks.
    'charge.success': async ({ event, req }) => {
      req.payload.logger.info(`Paystack charge.success received for reference: ${event.data?.reference}`)
    },
  },
})

export type PaystackAdapter = typeof paystackAdapter
