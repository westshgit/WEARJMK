'use server'

import type { Address, Cart } from '@/payload-types'
import zod from 'zod'
import { addressSchema } from '@/lib/schema/address'
import { flattenZodErrors } from '@/lib/schema'
import { syntheticServerRequest } from '@/lib/api/shared'
import { initializePaymentSchema } from '@/lib/schema/payment'
import { paystackConfirmOrderResultSchema } from '@/lib/schema/payment/paystack'
import { getCartById } from '@/lib/api/cart.api'
import type { ActionResult } from '@/lib/shared'
import type { ConfirmPaystackPaymentResult, InitializePaymentArgs, InitializePaymentResult, PaymentInitiatePaymentData } from '@/lib/api/payment/types'
import { paystackAdapter } from '@/lib/api/payment/paystack/adapter'

export async function initializePayment(args: InitializePaymentArgs): Promise<ActionResult<InitializePaymentResult>> {
  // Normalize and validate the checkout payload before touching payment state.
  // The form submits full cart data, but we only trust the cart ID/secret here.
  let req: Awaited<ReturnType<typeof syntheticServerRequest>> | undefined

  try {
    const parsedArgs = initializePaymentSchema.safeParse({
      cartId: args.cart.id,
      cartSecret: args.cart.secret ?? undefined,
      email: args.email,
      billingAddress: args.billingAddress,
      shippingAddress: args.shippingAddress,
    })

    if (!parsedArgs.success) {
      return {
        success: false,
        formError: 'Invalid checkout details.',
        fieldErrors: flattenZodErrors(parsedArgs.error),
      }
    }

    const { billingAddress, cartId, cartSecret, email, shippingAddress } = parsedArgs.data

    // Build a Payload-compatible request so downstream adapters and hooks receive
    // the same request shape they expect during normal Payload operations.
    req = await syntheticServerRequest()

    // Re-read the cart from Payload instead of trusting the client-provided cart.
    // This keeps totals, ownership, status, and secrets authoritative.
    const cart = await getCartById(cartId)

    if (!cart) return { success: false, formError: 'Cart not found.' }

    // A checkout can continue when the signed-in user owns the cart, or when a
    // guest checkout presents the matching cart secret.
    const cartCustomerID = cart.customer && typeof cart.customer === 'object' ? cart.customer.id : cart.customer
    const canAccessCart = Boolean(req.user && cartCustomerID === req.user.id) || Boolean(cartSecret && cart.secret && cartSecret === cart.secret)

    if (!canAccessCart) {
      return { success: false, formError: 'You do not have access to this cart.' }
    }

    // Do not initialize a second payment for a cart that has already completed checkout.
    if (cart.status === 'purchased' || cart.purchasedAt) {
      return { success: false, formError: 'This cart has already been purchased.' }
    }

    // Currency is required to select a gateway and to tell the adapter what to charge.
    if (!cart.currency) {
      return { success: false, formError: "Something went wrong: we couldn't process the payment right now." }
    }

    // The subtotal must be a positive integer in the smallest currency unit.
    // For NGN, this means the adapter receives kobo-ready amounts.
    if (typeof cart.subtotal !== 'number' || !Number.isSafeInteger(cart.subtotal) || cart.subtotal <= 0) {
      return { success: false, formError: 'Your cart has an invalid total.' }
    }

    const currency = cart.currency.toUpperCase()

    // Paystack is currently the gateway for NGN payments. Other currencies should
    // fail clearly until a matching adapter is added.
    if (currency !== 'NGN') {
      return { success: false, formError: 'Selected payment method is unavailable.' }
    }

    const paymentResult = await paystackAdapter.initiatePayment({
      data: {
        billingAddress: toPaymentAddress(billingAddress),
        cart: toPaymentCart(cart, currency, cart.subtotal),
        customerEmail: email,
        currency,
        shippingAddress: shippingAddress.sameAsBilling ? toPaymentAddress(billingAddress) : toPaymentAddress(shippingAddress.address),
      },
      req,
      transactionsSlug: 'transactions',
    })

    return {
      success: true,
      data: paymentResult,
    }
  } catch (error) {
    req?.payload.logger.error({
      err: error,
      msg: 'Error initializing payment',
    })

    // Keep user-facing errors friendly while preserving adapter-provided messages.
    return {
      success: false,
      formError: error instanceof Error ? error.message : 'Unable to initialize payment.',
    }
  }
}

export async function confirmPaystackPayment({ reference }: { reference: string }): Promise<ActionResult<ConfirmPaystackPaymentResult>> {
  let req: Awaited<ReturnType<typeof syntheticServerRequest>> | undefined

  try {
    const parsedReference = zod
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[A-Za-z0-9.=-]+$/)
      .safeParse(reference)

    if (!parsedReference.success) {
      return {
        success: false,
        formError: 'The Paystack transaction reference is invalid.',
      }
    }

    req = await syntheticServerRequest()
    const result = await paystackAdapter.confirmOrder({
      data: {
        reference: parsedReference.data,
      },
      req,
    })
    const parsedResult = paystackConfirmOrderResultSchema.safeParse(result)

    if (!parsedResult.success) {
      throw new Error('Paystack returned invalid order confirmation data.')
    }

    return {
      success: true,
      data: parsedResult.data,
    }
  } catch (error) {
    req?.payload.logger.error({
      err: error,
      msg: 'Error confirming Paystack payment',
    })

    return {
      success: false,
      formError: error instanceof Error ? error.message : 'Unable to confirm payment.',
    }
  }
}

function toPaymentAddress(address: zod.infer<typeof addressSchema>): Address {
  // The plugin types this transport value as a persisted Address, although its
  // adapters only consume the address fields and do not require document metadata.
  return address as Address
}

function toPaymentCart(cart: Cart, currency: string, subtotal: number): PaymentInitiatePaymentData['cart'] {
  // Payload's generated Cart permits nullable persisted fields while the
  // payment adapter accepts the same transport shape with normalized values.
  return {
    ...cart,
    currency,
    items: cart.items ?? [],
    subtotal,
  } as unknown as PaymentInitiatePaymentData['cart']
}
