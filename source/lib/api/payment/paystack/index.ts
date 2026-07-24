
import type { GroupField } from 'payload'

import { confirmOrder } from './confirmOrder'
import { initiatePayment } from './initiatePayment'
import { webhooksEndpoint } from './endpoints/webhooks'
import type { PaystackAdapterArgs } from './types'
import { PaymentAdapter, PaymentAdapterClient } from '@payloadcms/plugin-ecommerce/types'

/**
 * Fields stored on the transactions collection for the Paystack payment
 * method. Mirrors Stripe's `customerID` + `paymentIntentID` group, but holds
 * the Paystack `reference` and `accessCode`.
 */
const buildPaystackGroup = (args: PaystackAdapterArgs): GroupField => {
  const { groupOverrides } = args

  const baseFields = [
    {
      name: 'reference',
      type: 'text',
      label: 'Paystack Reference',
      required: true,
    },
    {
      name: 'accessCode',
      type: 'text',
      label: 'Paystack Access Code',
    },
  ] as const

  const groupField: GroupField = {
    name: 'paystack',
    type: 'group',
    ...groupOverrides,
    admin: {
      // Only show this group when the transaction uses Paystack.
      condition: (data) => data?.paymentMethod === 'paystack',
      ...groupOverrides?.admin,
    },
    fields: groupOverrides?.fields && typeof groupOverrides.fields === 'function' ? groupOverrides.fields({ defaultFields: [...baseFields] }) : [...baseFields],
  }

  return groupField
}

/**
 * The Paystack payment adapter — a drop-in alternative to the Stripe adapter
 * that fulfils the same `PaymentAdapter` contract used by
 * `@payloadcms/plugin-ecommerce`.
 *
 * It exposes three endpoints (all relative to `/api/payments/paystack`):
 *  - `POST /initiate`     → `initiatePayment` (Initialize Transaction)
 *  - `POST /confirm-order` → `confirmOrder`   (Verify Transaction + create order)
 *  - `POST /webhooks`     → webhook receiver  (HMAC-SHA512 verified)
 *
 * and adds a `paystack` group + `paystack` option to the transactions
 * collection's `paymentMethod` select.
 *
 * @example
 * ```ts
 * import { paystackAdapter } from '@/lib/api/payment/paystack'
 *
 * ecommercePlugin({
 *   payments: {
 *     paymentMethods: [
 *       paystackAdapter({
 *         secretKey: process.env.PAYSTACK_SECRET_KEY!,
 *         webhooks: {
 *           'charge.success': async ({ event, req }) => {
 *             // react to a successful charge server-side
 *           },
 *         },
 *       }),
 *     ],
 *   },
 * })
 * ```
 */
export const paystackAdapter = (args: PaystackAdapterArgs): PaymentAdapter => {
  const { secretKey, apiBase, webhooks } = args
  const label = args.label || 'Paystack'

  return {
    name: 'paystack',
    label,
    group: buildPaystackGroup(args),
    initiatePayment: initiatePayment({ secretKey, apiBase }),
    confirmOrder: confirmOrder({ secretKey, apiBase }),
    endpoints: [webhooksEndpoint({ secretKey, webhooks })],
  }
}

/**
 * Client-side descriptor — tells the ecommerce client context that the
 * Paystack method supports both `initiatePayment` and `confirmOrder`, and what
 * label to render in the payment-method picker.
 */
export const paystackAdapterClient = (args: { label?: string }): PaymentAdapterClient => ({
  name: 'paystack',
  label: args?.label || 'Paystack',
  confirmOrder: true,
  initiatePayment: true,
})

export type { PaystackAdapterArgs } from './types'
