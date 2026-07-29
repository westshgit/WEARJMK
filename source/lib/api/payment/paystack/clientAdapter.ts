'use client'

import type { PaymentAdapterClient, PaymentAdapterClientArgs } from '@payloadcms/plugin-ecommerce/types'

export function paystackAdapterClient({ label = 'Paystack' }: PaymentAdapterClientArgs = {}): PaymentAdapterClient {
  return {
    name: 'paystack',
    confirmOrder: true,
    initiatePayment: true,
    label,
  }
}
