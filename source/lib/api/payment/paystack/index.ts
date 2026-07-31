import type { GroupField } from 'payload'

import { confirmOrder } from './confirmOrder'
import { initiatePayment } from './initiatePayment'
import type { PaystackAdapterArgs } from './types'
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import { webhooksEndpoint } from './endpoints/webhook'

/**
 * Fields stored on the transactions collection for the Paystack payment
 * method. These preserve the provider response needed to verify the payment.
 */
const buildPaystackGroup = (args: PaystackAdapterArgs): GroupField => {
  const { groupOverrides } = args

  const baseFields = [
    {
      name: 'reference',
      type: 'text',
      label: 'Paystack Reference',
      required: true,
      index: true,
      unique: true,
    },
    {
      name: 'accessCode',
      type: 'text',
      label: 'Paystack Access Code',
    },
    {
      name: 'authorizationUrl',
      type: 'text',
      label: 'Paystack Authorization URL',
      admin: {
        readOnly: true,
      },
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
  const { apiBase, callbackUrl, referencePrefix, requestTimeoutMs, secretKey, webhooks } = args
  const label = args.label || 'Paystack'

  return {
    name: 'paystack',
    label,
    group: buildPaystackGroup(args),
    initiatePayment: initiatePayment({
      apiBase,
      callbackUrl,
      referencePrefix,
      requestTimeoutMs,
      secretKey,
    }),
    confirmOrder: confirmOrder({ apiBase, requestTimeoutMs, secretKey }),
    endpoints: [webhooksEndpoint({ apiBase, requestTimeoutMs, secretKey, webhooks })],
  }
}

export type { PaystackAdapterArgs }
