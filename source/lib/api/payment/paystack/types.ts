import type { GroupField, PayloadRequest } from 'payload'
import type { PaymentAdapterArgs } from '@payloadcms/plugin-ecommerce/types'

/**
 * Paystack API base URLs. The live API is used by default; point `apiBase` at a
 * mock/localstack instance for testing.
 *
 * @see https://paystack.com/docs/api/
 */
export const DEFAULT_PAYSTACK_API_BASE = 'https://api.paystack.co'

/**
 * A handler invoked when a Paystack webhook event is received. The event name
 * (e.g. `charge.success`, `charge.failed`) is used as the lookup key.
 *
 * @see https://paystack.com/docs/payments/webhooks/
 */
export type PaystackWebhookHandler = (args: { event: PaystackWebhookEvent; req: PayloadRequest }) => Promise<void> | void

/**
 * Map of Paystack event names to handlers. Keys are event types such as
 * `charge.success`, `charge.failed`, `transfer.success`, etc.
 */
export type PaystackWebhookHandlers = Record<string, PaystackWebhookHandler>

/**
 * Arguments for the Paystack payment adapter. This mirrors the shape of the
 * Stripe adapter args but swaps the Stripe-specific keys for Paystack ones.
 */
export type PaystackAdapterArgs = {
  /**
   * Paystack secret key. Used for both API auth (`Bearer <secretKey>`) and to
   * verify webhook signatures. Find it under Dashboard → Settings → API Keys
   * & Webhooks. Use `sk_test_...` for the sandbox and `sk_live_...` in prod.
   */
  secretKey: string
  /**
   * Override the Paystack REST API base. Defaults to the live API.
   */
  apiBase?: string
  /**
   * Optional webhook handlers keyed by event type. When a verified webhook
   * arrives, the matching handler is invoked.
   */
  webhooks?: PaystackWebhookHandlers
  /**
   * The label shown in the admin UI for this payment method. Defaults to
   * 'Paystack'.
   */
  label?: string
  /**
   * Override the default fields added to the transactions collection under the
   * `paystack` group.
   */
  groupOverrides?: PaymentAdapterArgs['groupOverrides']
}

/**
 * The default fields stored on a transaction for the `paystack` payment
 * method. The `reference` is what we generate and pass to Paystack; the
 * `accessCode` is returned by Paystack and used to open the inline popup.
 */
export type PaystackGroupField = GroupField

/* ----------------------------------------------------------------------------
 * Paystack REST API response shapes (subset we consume).
 * @see https://paystack.com/docs/api/transaction/
 * ------------------------------------------------------------------------- */

/** Generic envelope returned by every Paystack endpoint. */
export type PaystackResponse<T> = {
  status: boolean
  message: string
  data: T
}

/** Response from `POST /transaction/initialize`. */
export type PaystackInitializeData = {
  authorization_url: string
  access_code: string
  reference: string
}

/** Response from `GET /transaction/verify/:reference`. */
export type PaystackTransactionData = {
  id: number
  domain: string
  status: 'success' | 'failed' | 'abandoned' | 'pending' | 'reversed'
  reference: string
  amount: number
  currency: string
  channel: string
  customer: {
    id: number
    email: string
  }
  metadata: Record<string, unknown> | null
}

/** Payload of a Paystack webhook event. */
export type PaystackWebhookEvent = {
  event: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    currency: string
    customer: {
      id: number
      email: string
      customer_code: string
    }
    metadata: Record<string, unknown> | null
  }
}
