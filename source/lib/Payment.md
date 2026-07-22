# Paystack Payment Adapter — Translation Guide

This document explains how to **translate** (copy, not replace) the existing Stripe payment
adapter found in `source/patches/dist/payments/adapters/stripe/` into a **Paystack** adapter
that fulfills the exact same `PaymentAdapter` contract.

> Goal: build a new `source/payments/adapters/paystack/` module that the ecommerce plugin can
> consume alongside (or instead of) Stripe, without touching the patched plugin source.

---

## 1. The Contract We Must Satisfy

Every payment adapter is a factory that returns a `PaymentAdapter` object. From
`patches/dist/types/index.d.ts` the contract is:

```ts
export type PaymentAdapter = {
  /** Called via POST /api/payments/{provider_name}/initiate */
  initiatePayment: (args: {
    data: {
      billingAddress: Address
      cart: Cart // { id, items[], subtotal, currency, customer }
      currency: string // ISO 4217, e.g. 'NGN'
      customerEmail: string
      shippingAddress?: Address
    }
    req: PayloadRequest
    transactionsSlug: string // defaults to 'transactions'
    customersSlug?: string // defaults to 'users'
  }) => Promise<{ message: string; [key: string]: any }>

  /** Called via POST /api/payments/{provider_name}/confirm-order */
  confirmOrder: (args: {
    data: { [key: string]: any; customerEmail?: string }
    req: PayloadRequest
    cartsSlug?: string // defaults to 'carts'
    ordersSlug?: string // defaults to 'orders'
    transactionsSlug?: string // defaults to 'transactions'
  }) => Promise<{ message: string; orderID: ID; transactionID: ID; [key: string]: any }>

  /** Extra Payload endpoints bootstrapped under /api/payments/{provider_name} */
  endpoints?: Endpoint[] // e.g. webhook receiver at '/webhooks'

  /** Admin group field, shown on the transaction when paymentMethod === name */
  group: GroupField

  name: string // 'paystack'
  label?: string // 'Paystack'
}
```

The Stripe adapter satisfies this with four files. Our Paystack adapter will mirror that
1-to-1:

| Stripe file                             | Paystack file (to create)                 |
| --------------------------------------- | ----------------------------------------- |
| `adapters/stripe/index.js`              | `adapters/paystack/index.ts`              |
| `adapters/stripe/initiatePayment.js`    | `adapters/paystack/initiatePayment.ts`    |
| `adapters/stripe/confirmOrder.js`       | `adapters/paystack/confirmOrder.ts`       |
| `adapters/stripe/endpoints/webhooks.js` | `adapters/paystack/endpoints/webhooks.ts` |

---

## 2. Concept Mapping — Stripe vs Paystack

| Concept (Stripe)                             | Paystack equivalent                                         | Notes / differences                                                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `new Stripe(secretKey, {...})`               | `Authorization: Bearer <secretKey>` header                  | Paystack is a plain REST API; there is no SDK object. Use `fetch` or the `paystack` npm package.                                              |
| **PaymentIntent** (`paymentIntents.create`)  | **Initialize Transaction** (`POST /transaction/initialize`) | Both represent "an intent to collect money". Returns a `reference`, `access_code`, and `authorization_url`.                                   |
| `paymentIntent.client_secret`                | `authorization_url` / `access_code`                         | Stripe's `client_secret` confirms the intent client-side; Paystack redirects the user to `authorization_url` (or embeds the popup inline).    |
| `paymentIntent.id` (`pi_...`)                | transaction **`reference`** (you generate it)               | Paystack requires **you** to generate the unique reference, e.g. `ps_<cartId>_<timestamp>`. Store it as the transaction's paystack reference. |
| `paymentIntents.retrieve(id)` (verify)       | **Verify Transaction** `GET /transaction/verify/:reference` | Use this in `confirmOrder`. Webhook is the preferred path.                                                                                    |
| `stripe.customers.list/create`               | `POST /customer` (Create Customer)                          | Optional in Paystack; `email` is passed on `initialize`. We can still create a customer for record-keeping.                                   |
| `metadata` on PaymentIntent                  | `metadata` on Initialize Transaction                        | Paystack supports a `metadata` object — perfect for storing `cartID`, items snapshot, shipping address.                                       |
| **amount in minor units** (`1000` = $10)     | **amount in kobo/cents** (`100000` = ₦1000)                 | Same idea (minor units), but verify the currency's zero-decimal behavior. NGN/GHS/ZAR/KES use 2 decimals.                                     |
| `stripe-signature` header + `constructEvent` | `x-paystack-signature` header + **HMAC-SHA512** of raw body | Paystack signs with HMAC SHA512 using the **secret key**; compare to the header. No SDK helper — verify manually with `crypto`.               |
| Event `charge.succeeded` etc.                | `charge.success` event                                      | Paystack event types: `charge.success`, `charge.failed`, `transfer.*`, `refund.*`.                                                            |

---

## 3. Money / Amount Handling (IMPORTANT)

Stripe and Paystack both take amounts in the **smallest currency unit** (kobo for NGN, cents
for ZAR/GHS/KES, etc.). The Stripe adapter passes `amount = cart.subtotal` straight through.
For Paystack you must ensure `cart.subtotal` is already in minor units.

- `₦1,500.00` → amount `150000` kobo.
- If your cart stores amounts in major units, multiply by `100` before sending.
- Paystack's supported currencies: `NGN`, `GHS`, `ZAR`, `KES`, `XOF`, `USD`, `EGP`, `RWF`, `TZS`.
  Confirm the target currency is supported for your account.

---

## 4. `initiatePayment.ts` — Translated

This is the direct translation of `initiatePayment.js`. Comments mark what changed.

```ts
import type { InitiatePaymentReturnType } from './index.js'

type Props = {
  secretKey: string
  /** Optional: base URL for Paystack API, defaults to https://api.paystack.co */
  apiBase?: string
}

export const initiatePayment =
  (props: Props) =>
  async ({ data, req, transactionsSlug }) => {
    const payload = req.payload
    const { secretKey, apiBase = 'https://api.paystack.co' } = props || {}

    const customerEmail = data.customerEmail
    const currency = data.currency
    const cart = data.cart
    const amount = cart.subtotal // MUST be in minor units (kobo)
    const billingAddressFromData = data.billingAddress
    const shippingAddressFromData = data.shippingAddress

    // ---- Validation: identical to Stripe ----
    if (!secretKey) throw new Error('Paystack secret key is required.')
    if (!currency) throw new Error('Currency is required.')
    if (!cart || !cart.items || cart.items.length === 0) throw new Error('Cart is empty or not provided.')
    if (!customerEmail || typeof customerEmail !== 'string') throw new Error('A valid customer email is required to make a purchase.')
    if (!amount || typeof amount !== 'number' || amount <= 0) throw new Error('A valid amount is required to initiate a payment.')

    // Flatten cart items exactly like Stripe (preserves custom properties)
    const flattenedCart = cart.items.map((item) => {
      const productID = typeof item.product === 'object' ? item.product.id : item.product
      const variantID = item.variant ? (typeof item.variant === 'object' ? item.variant.id : item.variant) : undefined
      const { product: _product, variant: _variant, ...customProperties } = item
      return {
        ...customProperties,
        product: productID,
        quantity: item.quantity,
        ...(variantID ? { variant: variantID } : {}),
      }
    })

    // ---- CHANGED: generate our own reference (Stripe auto-generated pi_...) ----
    const reference = `ps_${cart.id}_${Date.now()}`

    try {
      // ---- CHANGED: Initialize Transaction instead of PaymentIntent ----
      const res = await fetch(`${apiBase}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          amount, // minor units
          currency, // 'NGN', 'GHS', ...
          reference, // unique, we store it
          callback_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout/verify`,
          metadata: {
            cart_id: cart.id,
            cart_items_snapshot: JSON.stringify(flattenedCart),
            shipping_address: JSON.stringify(shippingAddressFromData),
            custom_fields: [{ display_name: 'Cart ID', variable_name: 'cart_id', value: cart.id }],
          },
        }),
      })

      const json = await res.json()
      if (!json.status) {
        throw new Error(json.message || 'Failed to initialize Paystack transaction')
      }

      const { authorization_url, access_code, reference: txnRef } = json.data

      // ---- Create a transaction record (same shape as Stripe, swap field names) ----
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
            reference: txnRef,
            accessCode: access_code,
          },
        },
        req,
      })

      // ---- CHANGED return: no clientSecret; return authorization_url + reference ----
      const returnData: InitiatePaymentReturnType = {
        message: 'Payment initiated successfully',
        reference: txnRef,
        authorizationUrl: authorization_url,
        accessCode: access_code,
      }
      return returnData
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: 'Error initiating payment with Paystack',
      })
      throw new Error(error instanceof Error ? error.message : 'Unknown error initiating payment')
    }
  }
```

### Key differences from Stripe's `initiatePayment`

1. **Reference is self-generated.** Stripe's `paymentIntents.create` returns an ID; Paystack
   requires us to supply `reference` on `initialize`. Generate `ps_<cartId>_<timestamp>`.
2. **No `client_secret`.** Paystack returns `authorization_url` (redirect the browser there or
   open the Paystack Inline popup with `access_code`). The client side calls `confirmOrder`
   after the user returns from Paystack.
3. **Customer creation is optional.** Stripe explicitly lists/creates a Customer. For Paystack
   you can pass `email` directly to `initialize`; optionally call `POST /customer` to keep a
   record (see §7).
4. **`callback_url`** tells Paystack where to redirect after payment — wire it to your verify
   route.

---

## 5. `confirmOrder.ts` — Translated

```ts
type Props = {
  secretKey: string
  apiBase?: string
}

export const confirmOrder =
  (props: Props) =>
  async ({ cartsSlug = 'carts', data, ordersSlug = 'orders', req, transactionsSlug = 'transactions' }) => {
    const payload = req.payload
    const { secretKey, apiBase = 'https://api.paystack.co' } = props || {}
    const customerEmail = data.customerEmail
    const reference = data.reference // CHANGED: was paymentIntentID

    if (!secretKey) throw new Error('Paystack secret key is required')
    if (!reference) throw new Error('Transaction reference is required')

    try {
      // ---- Find our transaction by reference (was by stripe.paymentIntentID) ----
      const transactionsResults = await payload.find({
        collection: transactionsSlug,
        req,
        where: { 'paystack.reference': { equals: reference } },
      })
      const transaction = transactionsResults.docs[0]
      if (!transactionsResults.totalDocs || !transaction) throw new Error('No transaction found for the provided reference')

      // ---- CHANGED: Verify Transaction instead of paymentIntents.retrieve ----
      const res = await fetch(`${apiBase}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${secretKey}` },
      })
      const json = await res.json()
      if (!json.status) throw new Error(json.message || 'Verification failed')

      const txnData = json.data
      // Paystack status: 'success' | 'failed' | 'abandoned' | 'pending' | 'reversed'
      if (txnData.status !== 'success') throw new Error(`Payment not completed. Status: ${txnData.status}`)

      const amount = txnData.amount // minor units
      const currency = txnData.currency.toUpperCase()

      // Recover cart snapshot from metadata (same pattern as Stripe)
      const metadata = txnData.metadata || {}
      const cartID = metadata.cart_id
      const cartItemsSnapshot = metadata.cart_items_snapshot ? JSON.parse(metadata.cart_items_snapshot) : undefined
      const shippingAddress = metadata.shipping_address ? JSON.parse(metadata.shipping_address) : undefined

      if (!cartID) throw new Error('Cart ID not found in transaction metadata')
      if (!cartItemsSnapshot || !Array.isArray(cartItemsSnapshot)) throw new Error('Cart items snapshot not found or invalid in metadata')

      // ---- Create the order (identical to Stripe) ----
      const order = await payload.create({
        collection: ordersSlug,
        data: {
          amount,
          currency,
          ...(req.user ? { customer: req.user.id } : { customerEmail }),
          items: cartItemsSnapshot,
          shippingAddress,
          status: 'processing',
          transactions: [transaction.id],
        },
        req,
      })

      const timestamp = new Date().toISOString()
      await payload.update({
        id: cartID,
        collection: cartsSlug,
        data: { purchasedAt: timestamp },
        req,
      })
      await payload.update({
        id: transaction.id,
        collection: transactionsSlug,
        data: { order: order.id, status: 'succeeded' },
        req,
      })

      return {
        message: 'Payment confirmed successfully',
        orderID: order.id,
        transactionID: transaction.id,
        ...(order.accessToken ? { accessToken: order.accessToken } : {}),
      }
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: 'Error confirming order with Paystack',
      })
      throw new Error(error instanceof Error ? error.message : 'Unknown error confirming payment')
    }
  }
```

### Key differences from Stripe's `confirmOrder`

1. **Identifier is `reference`**, not `paymentIntentID`.
2. **Verify endpoint** `GET /transaction/verify/:reference` replaces `paymentIntents.retrieve`.
3. **Success status** is the string `'success'` (Stripe used `'succeeded'`).
4. **Amount comes back** in minor units, same as sent.

> **Idempotency note:** Paystack strongly recommends verifying by **webhook** rather than (or
> in addition to) the verify endpoint, because the redirect can be spoofed. See §6.

---

## 6. `endpoints/webhooks.ts` — Translated

Paystack signs the **entire raw body** with HMAC-SHA512 using your **secret key**, and sends
the hex digest in the `x-paystack-signature` header. There is no SDK helper — verify manually.

```ts
import crypto from 'crypto'
import type { Endpoint } from 'payload'

type PaystackWebhookHandler = (args: { event: PaystackEvent; req: PayloadRequest }) => Promise<void> | void

type PaystackWebhookHandlers = Record<string, PaystackWebhookHandler>

type Props = {
  secretKey: string
  webhooks?: PaystackWebhookHandlers
  webhookSecret?: string // = secretKey for Paystack; kept for API parity
}

export const webhooksEndpoint = (props: Props): Endpoint => {
  const { secretKey, webhooks } = props || {}

  const handler = async (req) => {
    let returnStatus = 200

    if (secretKey && req.text) {
      const body = await req.text()

      // ---- CHANGED: HMAC SHA512 verification (was stripe.webhooks.constructEvent) ----
      const hash = crypto.createHmac('sha512', secretKey).update(body).digest('hex')

      const signature = req.headers.get('x-paystack-signature')

      if (signature && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
        const event = JSON.parse(body) as PaystackEvent

        // event.event === 'charge.success' | 'charge.failed' | ...
        if (webhooks && typeof webhooks[event.event] === 'function') {
          await webhooks[event.event]({ event, req })
        }
      } else {
        req.payload.logger.error('Invalid Paystack webhook signature')
        returnStatus = 401
      }
    }

    return Response.json({ received: true }, { status: returnStatus })
  }

  return { handler, method: 'post', path: '/webhooks' }
}
```

Where the event shape is roughly:

```ts
type PaystackEvent = {
  event: string // 'charge.success', 'charge.failed', ...
  data: {
    reference: string
    status: string // 'success' | 'failed' | ...
    amount: number // minor units
    currency: string
    customer: { id: number; email: string }
    metadata: Record<string, unknown>
  }
}
```

### Webhook checklist (Paystack dashboard)

- Set the webhook URL to `https://<your-domain>/api/payments/paystack/webhooks`.
- The signing secret **is your secret key** (unlike Stripe's separate `whsec_...`).
- Always return `200` quickly; do heavy work async if needed.
- Treat `charge.success` as the source of truth — verify the `reference`, then mark the
  transaction `succeeded` and create the order. This guards against a forged redirect.

---

## 7. `index.ts` — The Factory (Mirror of Stripe's)

```ts
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce'
import type { GroupField } from 'payload'
import { confirmOrder } from './confirmOrder'
import { webhooksEndpoint } from './endpoints/webhooks'
import { initiatePayment } from './initiatePayment'

export type InitiatePaymentReturnType = {
  message: string
  reference: string
  authorizationUrl: string
  accessCode: string
}

export type PaystackAdapterArgs = {
  secretKey: string
  apiBase?: string
  webhooks?: Record<string, (args: { event: any; req: any }) => Promise<void> | void>
  label?: string
  groupOverrides?: { fields?: FieldsOverride } & Partial<Omit<GroupField, 'fields'>>
}

export const paystackAdapter = (props: PaystackAdapterArgs): PaymentAdapter => {
  const { secretKey, apiBase, groupOverrides, webhooks } = props
  const label = props?.label || 'Paystack'

  // CHANGED: group name 'paystack' with fields 'reference' + 'accessCode'
  // (Stripe used 'customerID' + 'paymentIntentID')
  const baseFields = [
    { name: 'reference', type: 'text', label: 'Paystack Reference', required: true },
    { name: 'accessCode', type: 'text', label: 'Paystack Access Code' },
  ]

  const groupField: GroupField = {
    name: 'paystack',
    type: 'group',
    ...groupOverrides,
    admin: {
      condition: (data) => data?.paymentMethod === 'paystack',
      ...groupOverrides?.admin,
    },
    fields: groupOverrides?.fields && typeof groupOverrides?.fields === 'function' ? groupOverrides.fields({ defaultFields: baseFields }) : baseFields,
  }

  return {
    name: 'paystack',
    confirmOrder: confirmOrder({ secretKey, apiBase }),
    endpoints: [webhooksEndpoint({ secretKey, webhooks })],
    group: groupField,
    initiatePayment: initiatePayment({ secretKey, apiBase }),
    label,
  }
}

// Client-side descriptor — tells the ecommerce context this method is supported
export const paystackAdapterClient = (props: { label?: string }) => ({
  name: 'paystack',
  confirmOrder: true,
  initiatePayment: true,
  label: props?.label || 'Paystack',
})
```

### Wiring into `payload.config.ts`

```ts
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { paystackAdapter } from './payments/adapters/paystack'

ecommercePlugin({
  // ...
  payments: {
    paymentMethods: [
      paystackAdapter({
        secretKey: process.env.PAYSTACK_SECRET_KEY!, // sk_live_... or sk_test_...
        apiBase: process.env.PAYSTACK_API_BASE, // optional override
        webhooks: {
          'charge.success': async ({ event, req }) => {
            // optional: react to success server-side
          },
        },
      }),
    ],
  },
})
```

The plugin will then expose:

- `POST /api/payments/paystack/initiate`
- `POST /api/payments/paystack/confirm-order`
- `POST /api/payments/paystack/webhooks`

and add a `paystack` group + `paystack` option to the `paymentMethod` select on transactions.

---

## 8. Optional: Paystack Customer (parallel to Stripe Customer)

Stripe explicitly `customers.list`/`customers.create`. For Paystack, creating a customer is
optional because `initialize` accepts `email` directly. If you want parity for record-keeping:

```ts
// Inside initiatePayment, before initializing the transaction:
let customerCode: string | undefined
const custRes = await fetch(`${apiBase}/customer`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: customerEmail,
    first_name: billingAddressFromData?.firstName,
    last_name: billingAddressFromData?.lastName,
    metadata: { cart_id: cart.id },
  }),
})
if (custRes.ok) {
  const c = await custRes.json()
  customerCode = c.data?.customer_code
}
```

You can then store `customerCode` in the `paystack` group if you add a field for it, and pass
it on future transactions. This is **optional** — Paystack will auto-create a customer record
from the `email` on `initialize` regardless.

---

## 9. Environment Variables

Add to `.env`:

```bash
# Server-only — never expose to the client
PAYSTACK_SECRET_KEY
# Optional API base (use https://api.paystack.co for live, or a mock)
PAYSTACK_API_BASE

# Public — your app's base URL, used for the payment callback redirect
NEXT_PUBLIC_SERVER_URL
```

The Paystack **public key** (`pk_...`) is only needed if you embed the Paystack Inline popup
client-side instead of redirecting to `authorization_url`. It is **not** required by the
adapter itself.

---

## 10. Client-Side Flow (how checkout calls the adapter)

The ecommerce context exposes `initiatePayment` / `confirmOrder`. The Paystack flow differs
from Stripe on the client:

1. **Stripe:** `initiatePayment` → returns `clientSecret` → confirm card with Stripe.js →
   `confirmOrder` with `paymentIntentID`.
2. **Paystack:** `initiatePayment` → returns `authorizationUrl` → **redirect** the browser to
   it (or open Paystack Inline popup using `access_code`) → on return, read `reference` from
   the query string / `trxref` → call `confirmOrder` with `{ reference }`.

Example checkout handler:

```ts
// initiate
const res = await initiatePayment('paystack', {
  additionalData: { customerEmail, currency, cart, billingAddress, shippingAddress },
})
// res = { reference, authorizationUrl, accessCode, message }

// redirect user to Paystack
window.location.href = res.authorizationUrl

// on the /checkout/verify page (callback_url), after redirect:
const reference = searchParams.get('reference') ?? searchParams.get('trxref')
await confirmOrder('paystack', { additionalData: { reference } })
```

> ⚠️ Because the redirect can be tampered with, the **webhook** (`charge.success`) is the
> trusted source for creating the order. Consider having `confirmOrder` verify server-side
> (which it does above) AND processing `charge.success` in the webhook. Guard against double
> order creation by checking the transaction status before creating the order.

---

## 11. Translation Cheat-Sheet (quick lookup)

| Stripe code                                                    | Paystack code                                                                   |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `new Stripe(secretKey, { apiVersion })`                        | `fetch(url, { headers: { Authorization: \`Bearer ${secretKey}\` } })`           |
| `stripe.paymentIntents.create({ amount, currency, metadata })` | `POST /transaction/initialize { email, amount, currency, reference, metadata }` |
| `paymentIntent.id`                                             | self-generated `reference`                                                      |
| `paymentIntent.client_secret`                                  | `authorization_url` / `access_code`                                             |
| `stripe.paymentIntents.retrieve(id)`                           | `GET /transaction/verify/:reference`                                            |
| status `'succeeded'`                                           | status `'success'`                                                              |
| `stripe.customers.list({ email })` / `.create`                 | `POST /customer { email }` (optional)                                           |
| `stripe-signature` header                                      | `x-paystack-signature` header                                                   |
| `stripe.webhooks.constructEvent(body, sig, secret)`            | `crypto.createHmac('sha512', secretKey).update(body).digest('hex')` === header  |
| event `charge.succeeded`                                       | event `charge.success`                                                          |
| metadata key `cartID`                                          | metadata key `cart_id` (or any key — your choice)                               |
| transaction field `stripe.paymentIntentID`                     | transaction field `paystack.reference`                                          |

---

## 12. Pitfalls & Things Stripe Does That Paystack Doesn't

1. **No SDK object.** Paystack is REST-only. Either use `fetch` directly or a community SDK
   (e.g. `paystack` npm package). Prefer `fetch` to avoid extra dependencies per AGENTS.md.
2. **You generate the reference.** Make it unique and collision-resistant; include the cart ID
   and a timestamp/UUID.
3. **Signing secret = secret key.** There is no separate webhook secret. Anyone with the
   secret key can forge events — keep it server-side only.
4. **Redirect-based, not iframe-secret-based.** The client experience is a redirect or a
   popup, not a card element bound to a `client_secret`.
5. **Double-order risk.** Because both the redirect callback and the webhook can trigger order
   creation, make order creation idempotent on the transaction reference (check status before
   creating).
6. **Currency support.** Confirm the account accepts the configured currency (NGN, GHS, ZAR,
   KES, etc.). USD may not be enabled for all accounts.
7. **Test vs live keys.** `sk_test_...` for sandbox, `sk_live_...` for production. Swap via
   env var only.
8. **Webhook must return 200.** Paystack retries on non-200. Fail fast and process async if
   needed.

---

## References

- [Paystack Transaction API — Initialize & Verify](https://paystack.com/docs/api/transaction/)
- [Paystack Customer API](https://paystack.com/docs/api/customer/)
- [Paystack Webhooks](https://paystack.com/docs/payments/webhooks/)
- [Paystack Verify Payments](https://paystack.com/docs/payments/verify-payments/)
- [Paystack Authentication (Bearer secret key)](https://paystack.com/docs/api/authentication/)
- Stripe adapter source (reference): `source/patches/dist/payments/adapters/stripe/`
- Adapter contract: `source/patches/dist/types/index.d.ts` (`PaymentAdapter`)
