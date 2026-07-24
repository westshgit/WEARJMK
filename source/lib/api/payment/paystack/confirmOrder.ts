
import { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import { DEFAULT_PAYSTACK_API_BASE } from './types'
import type { PaystackResponse, PaystackTransactionData } from './types'

type Props = {
  secretKey: string
  apiBase?: string
}

/**
 * Build the Paystack REST client for verification. Auth is a simple Bearer
 * token — no SDK object involved.
 */
const paystackClient = (secretKey: string, apiBase: string) => ({
  verify: async (reference: string) => {
    const res = await fetch(`${apiBase}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${secretKey}` },
    })
    const json = (await res.json()) as PaystackResponse<PaystackTransactionData>
    if (!json.status) {
      throw new Error(json.message || 'Paystack failed to verify the transaction')
    }
    return json.data
  },
})

/**
 * `confirmOrder` — the Paystack translation of the Stripe adapter's
 * `confirmOrder`.
 *
 * Stripe retrieves the PaymentIntent and checks `status === 'succeeded'`.
 * Paystack verifies the transaction via `GET /transaction/verify/:reference`
 * and checks `status === 'success'` (note the different spelling).
 *
 * The reference is the identifier we generated in `initiatePayment` and stored
 * on the transaction's `paystack` group.
 *
 * > **Webhook is the source of truth.** The redirect that lands the shopper on
 * > `confirm-order` can be spoofed, so this verify call is a second line of
 * > defence. The `charge.success` webhook handler should be treated as
 * > authoritative. Guard against double order creation by checking the
 * > transaction status before creating the order.
 *
 * @see https://paystack.com/docs/api/transaction/#verify
 */
export const confirmOrder =
  (props: Props): NonNullable<PaymentAdapter>['confirmOrder'] =>
  async ({ cartsSlug = 'carts', data, ordersSlug = 'orders', req, transactionsSlug = 'transactions' }) => {
    const payload = req.payload
    const { secretKey } = props
    const apiBase = props.apiBase || DEFAULT_PAYSTACK_API_BASE

    const customerEmail = data.customerEmail
    // CHANGED: the identifier is the Paystack reference, not a PaymentIntent id.
    const reference = data.reference as string | undefined

    if (!secretKey) {
      throw new Error('Paystack secret key is required')
    }
    if (!reference) {
      throw new Error('Transaction reference is required')
    }

    const paystack = paystackClient(secretKey, apiBase)

    try {
      // ---- Find our transaction by reference (was stripe.paymentIntentID) --
      const transactionsResults = await payload.find({
        collection: (transactionsSlug as 'transactions') || 'transactions',
        req,
        where: {
          'paystack.reference': { equals: reference },
        },
      })
      const transaction = transactionsResults.docs[0]
      if (!transactionsResults.totalDocs || !transaction) {
        throw new Error('No transaction found for the provided reference')
      }

      // Idempotency: if an order already exists for this transaction, return
      // it instead of creating a duplicate. The redirect + webhook race can
      // otherwise double-charge the order.
      const existingOrder = await payload.find({
        collection: ordersSlug as 'orders',
        limit: 1,
        req,
        where: {
          transactions: { equals: transaction.id },
        },
      })
      const existing = existingOrder.docs[0]
      if (existing) {
        return {
          message: 'Order already confirmed',
          orderID: existing.id,
          transactionID: transaction.id,
          ...('accessToken' in existing && existing.accessToken ? { accessToken: existing.accessToken as string } : {}),
        }
      }

      // ---- CHANGED: Verify Transaction instead of paymentIntents.retrieve --
      const txnData = await paystack.verify(reference)

      // Paystack statuses: 'success' | 'failed' | 'abandoned' | 'pending' | 'reversed'
      if (txnData.status !== 'success') {
        throw new Error(`Payment not completed. Status: ${txnData.status}`)
      }

      const amount = txnData.amount // kobo (minor units)
      const currency = txnData.currency.toUpperCase()

      // Recover the cart snapshot from metadata (same pattern as Stripe).
      const metadata = (txnData.metadata ?? {}) as Record<string, unknown>
      const cartID = metadata['cart_id'] as string | undefined
      const cartItemsSnapshotRaw = metadata['cart_items_snapshot'] as string | undefined
      const shippingAddressRaw = metadata['shipping_address'] as string | undefined

      const cartItemsSnapshot = cartItemsSnapshotRaw ? JSON.parse(cartItemsSnapshotRaw) : undefined
      const shippingAddress = shippingAddressRaw ? JSON.parse(shippingAddressRaw) : undefined

      if (!cartID) {
        throw new Error('Cart ID not found in the transaction metadata')
      }
      if (!cartItemsSnapshot || !Array.isArray(cartItemsSnapshot)) {
        throw new Error('Cart items snapshot not found or invalid in the transaction metadata')
      }

      // ---- Create the order (identical to Stripe) -------------------------
      const order = await payload.create({
        collection: ordersSlug as 'orders',
        data: {
          amount,
          currency: (currency?.toUpperCase() as 'NGN') || 'NGN',
          ...(req.user ? { customer: req.user.id } : customerEmail ? { customerEmail } : {}),
          items: cartItemsSnapshot,
          shippingAddress: shippingAddress ?? undefined,
          status: 'processing',
          transactions: [transaction.id],
        },
        req,
      })

      const timestamp = new Date().toISOString()
      await payload.update({
        id: cartID,
        collection: cartsSlug as 'carts',
        data: { purchasedAt: timestamp },
        req,
      })
      await payload.update({
        id: transaction.id,
        collection: transactionsSlug as 'transactions',
        data: { order: order.id, status: 'succeeded' },
        req,
      })

      return {
        message: 'Payment confirmed successfully',
        orderID: order.id,
        transactionID: transaction.id,
        ...('accessToken' in order && order.accessToken ? { accessToken: order.accessToken as string } : {}),
      }
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: 'Error confirming order with Paystack',
      })
      throw new Error(error instanceof Error ? error.message : 'Unknown error confirming payment')
    }
  }
