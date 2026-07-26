# Payments

This directory contains provider adapters used by Payload Ecommerce. Paystack is
the active provider for `NGN`; Stripe remains configured separately.

## Ownership

- Payload Ecommerce owns cart subtotal calculation through its cart
  `beforeChange` hook.
- `payment.api.ts` reloads the cart from Payload and passes the persisted
  subtotal to the adapter. Payment code must not maintain a second subtotal
  formula.
- Paystack receives and returns amounts in the currency subunit. For NGN,
  `10000` means `NGN 100.00`.
- Paystack's verified amount and currency are authoritative during order
  fulfillment, but they must exactly match the transaction stored before the
  customer was redirected.

## Environment

The server validates these values in `source/lib/env.ts`:

```env
PAYSTACK_SECRET_KEY=sk_test_
PAYSTACK_API_BASE_URL=https://api.paystack.co
PAYSTACK_CALLBACK_URL=http://localhost:3000/checkout/confirm-order
PAYSTACK_REFERENCE_PREFIX=wearjmk
PAYSTACK_REQUEST_TIMEOUT_MS=10000
```

Use a fully qualified callback URL. The reference prefix may contain only
letters, numbers, `.`, `=`, and `-`.

## Payment Flow

1. Checkout submits the cart ID, cart secret, email, and addresses to
   `initializePayment` in `source/lib/api/payment.api.ts`.
2. The server reloads the cart, verifies ownership, rejects purchased carts,
   and resaves its items through Payload's cart hook so the canonical subtotal
   is refreshed from current product prices.
3. The refreshed cart must contain a positive integer subtotal.
4. `paystack/initiatePayment.ts` reuses a matching pending transaction when
   possible. Otherwise, it initializes Paystack and stores the reference,
   access code, authorization URL, amount, currency, cart, and item snapshot.
5. The browser redirects to Paystack's authorization URL.
6. Paystack redirects to `PAYSTACK_CALLBACK_URL` with `reference` or `trxref`.
7. `confirmPaystackPayment` verifies the reference from the server. The browser
   never decides whether a payment succeeded.
8. `paystack/fulfillOrder.ts` verifies amount, currency, customer, and payment
   status before creating an order and marking the transaction succeeded.
9. `POST /api/payments/paystack/webhooks` independently verifies
   `x-paystack-signature`, re-verifies the transaction with Paystack, and runs
   the same idempotent fulfillment path.

## Idempotency

- Paystack transaction references are unique.
- Pending authorization URLs are stored so repeated initialization can resume
  the existing session.
- Orders store a unique `paymentReference`. If the callback and webhook arrive
  together, only one order can be created.
- Inventory is decremented only by the fulfillment attempt that created the
  order.

Schema changes require regenerated Payload types and a migration. Never edit
`payload-types.ts` manually.

## Webhooks

Paystack documents `charge.success` for successful charges. Do not depend on a
`charge.failed` webhook. Callback verification can mark terminal unsuccessful
statuses as failed.

The webhook returns a non-success response when verified processing fails so
Paystack retries the event. Processing is intentionally synchronous until a
durable Payload job queue is configured; acknowledging before durable storage
could lose a paid order.

Configure the public webhook URL in the Paystack dashboard:

```text
https://your-domain.example/api/payments/paystack/webhooks
```

## Legacy Order Totals

Order pages recover missing totals from linked succeeded transactions at read
time. To persist recoverable totals, run the `repair:order-amounts` package
script after applying the current migration. Orders without a valid linked
transaction are skipped for manual review.

## Troubleshooting

- **Payment button does nothing:** inspect the returned form error and confirm
  the cart has items, a positive persisted subtotal, and either a matching
  authenticated customer or guest cart secret.
- **Paystack initialization fails:** verify all Paystack environment values,
  especially the full callback URL and a reference prefix without underscores.
- **Callback keeps retrying:** inspect the server-side confirmation error. The
  reference must exist locally and Paystack must verify it as successful.
- **Webhook returns 401:** the raw request body or
  `x-paystack-signature` does not match `PAYSTACK_SECRET_KEY`.
- **Order amount is unavailable:** inspect the linked transaction. A safe
  repair requires a succeeded transaction with a positive amount and currency.
