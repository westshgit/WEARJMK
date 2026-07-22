import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

import { DEFAULT_PAYSTACK_API_BASE } from './types'
import type { PaystackInitializeData, PaystackResponse } from './types'

type Props = {
  secretKey: string
  apiBase?: string
}

/**
 * Build the Paystack REST client. Every request carries the secret key as a
 * Bearer token — there is no SDK object like Stripe's `new Stripe(...)`.
 */
const paystackClient = (secretKey: string, apiBase: string) => {
  const headers = {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
  }

  return {
    initialize: async (body: Record<string, unknown>) => {
      const res = await fetch(`${apiBase}/transaction/initialize`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      const json = (await res.json()) as PaystackResponse<PaystackInitializeData>
      if (!json.status) {
        throw new Error(json.message || 'Paystack failed to initialize the transaction')
      }
      return json.data
    },
  }
}

/**
 * Flatten cart items into the lightweight shape stored on the transaction, the
 * Paystack metadata snapshot and eventually the order. Mirrors the Stripe
 * adapter exactly so orders look identical regardless of provider.
 *
 * Custom properties added via `cartItemMatcher` (e.g. delivery options) are
 * preserved.
 */
const flattenCartItems: NonNullable<PaymentAdapter>['initiatePayment'] extends (
  args: infer Args,
) => unknown
  ? (cart: Args['data']['cart']) => Array<Record<string, unknown>>
  : never = (cart) => {
  return cart.items.map((item) => {
    const productID = typeof item.product === 'object' ? item.product.id : item.product
    const variantID = item.variant
      ? typeof item.variant === 'object'
        ? item.variant.id
        : item.variant
      : undefined

    // Strip the populated relationship objects, keep the rest.
    const { product: _product, variant: _variant, ...customProperties } = item as Record<
      string,
      unknown
    >

    return {
      ...customProperties,
      product: productID,
      quantity: item.quantity,
      ...(variantID ? { variant: variantID } : {}),
    }
  })
}

/**
 * Generate a unique Paystack transaction reference. Paystack requires the
 * merchant to supply the reference (Stripe auto-generates the PaymentIntent
 * id). We combine the cart id and a timestamp to keep it collision resistant
 * while remaining human readable in the dashboard.
 */
const generateReference = (cartID: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  return `wearjmk_${cartID}_${timestamp}_${random}`
}

/**
 * `initiatePayment` — the Paystack translation of the Stripe adapter's
 * `initiatePayment`.
 *
 * Stripe creates a PaymentIntent (auto-allocated id + `client_secret`).
 * Paystack instead requires us to generate a `reference` and returns an
 * `authorization_url` (and `access_code`) which the client uses to redirect
 * the shopper to Paystack's hosted checkout (or open the inline popup).
 *
 * The amount (`cart.subtotal`) is already in minor units (kobo for NGN) because
 * the ecommerce plugin stores every price via `convertToBaseValue` and computes
 * the cart subtotal from those base values. Paystack also expects kobo, so the
 * amount passes through unchanged.
 *
 * @see https://paystack.com/docs/api/transaction/#initialize
 */
export const initiatePayment =
  (props: Props): NonNullable<PaymentAdapter>['initiatePayment'] =>
  async ({ data, req, transactionsSlug }) => {
    const payload = req.payload
    const { secretKey } = props
    const apiBase = props.apiBase || DEFAULT_PAYSTACK_API_BASE

    const customerEmail = data.customerEmail
    const currency = data.currency
    const cart = data.cart
    const amount = cart.subtotal // kobo (minor units) — see file header
    const billingAddressFromData = data.billingAddress
    const shippingAddressFromData = data.shippingAddress

    // ---- Validation: identical to the Stripe adapter ----------------------
    if (!secretKey) {
      throw new Error('Paystack secret key is required.')
    }
    if (!currency) {
      throw new Error('Currency is required.')
    }
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty or not provided.')
    }
    if (!customerEmail || typeof customerEmail !== 'string') {
      throw new Error('A valid customer email is required to make a purchase.')
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new Error('A valid amount is required to initiate a payment.')
    }

    const flattenedCart = flattenCartItems(cart)
    const reference = generateReference(String(cart.id))

    // Resolve the callback URL the shopper is redirected to after paying.
    const serverURL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      (typeof req.headers?.get === 'function'
        ? req.headers.get('origin') || ''
        : '')

    const paystack = paystackClient(secretKey, apiBase)

    try {
      // ---- CHANGED: Initialize Transaction instead of PaymentIntent --------
      const initialized = await paystack.initialize({
        email: customerEmail,
        amount, // kobo
        currency, // 'NGN'
        reference,
        // Where Paystack sends the browser once payment completes (or fails).
        callback_url: serverURL ? `${serverURL}/checkout/confirm-order` : undefined,
        metadata: {
          // Paystack metadata is a free-form object — we mirror the Stripe
          // snapshot so confirmOrder / the webhook can rebuild the order.
          cart_id: String(cart.id),
          cart_items_snapshot: JSON.stringify(flattenedCart),
          shipping_address: JSON.stringify(shippingAddressFromData ?? null),
          custom_fields: [
            { display_name: 'Cart ID', variable_name: 'cart_id', value: String(cart.id) },
          ],
        },
      })

      // ---- Create a transaction record (same shape as Stripe, NGN fields) -
      const transaction = await payload.create({
        collection: transactionsSlug,
        data: {
          ...(req.user ? { customer: req.user.id } : { customerEmail }),
          amount,
          billingAddress: billingAddressFromData,
          cart: cart.id,
          currency: currency.toUpperCase(),
          items: flattenedCart,
          paymentMethod: 'paystack',
          status: 'pending',
          paystack: {
            reference: initialized.reference,
            accessCode: initialized.access_code,
          },
        },
        req,
      })

      // ---- CHANGED return: authorizationUrl + reference (no clientSecret) -
      return {
        message: 'Payment initiated successfully',
        reference: initialized.reference,
        authorizationUrl: initialized.authorization_url,
        accessCode: initialized.access_code,
        transactionID: transaction.id,
      }
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: 'Error initiating payment with Paystack',
      })
      throw new Error(
        error instanceof Error ? error.message : 'Unknown error initiating payment',
      )
    }
  }
