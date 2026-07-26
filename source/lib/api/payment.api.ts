'use server'

import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

import type { Cart } from '@/payload-types'
import { paystackAdapter } from './payment/paystack/paystackAdapter'
import zod from 'zod'
import { emailSchema } from '../schema/authentication'
import { addressSchema } from '../schema/address'
import { flattenZodErrors } from '../schema'
import { syntheticServerRequest } from './shared'
import type { ActionResult } from '../shared'

export type PaystackPaymentData = {
  accessCode: string
  authorizationUrl: string
  provider: 'paystack'
  reference: string
  transactionID: string | number
}

export type PaystackConfirmationData = {
  accessToken?: string
  orderID: string | number
}

export interface InitializePaymentArgs {
  cart: Cart
  email: string
  billingAddress: zod.infer<typeof addressSchema>
  shippingAddress:
    | {
        sameAsBilling: true
      }
    | {
        sameAsBilling: false
        address: zod.infer<typeof addressSchema>
      }
}

type InitiatePaymentResponse = {
  accessCode?: unknown
  authorizationUrl?: unknown
  reference?: unknown
  transactionID?: unknown
}

type ConfirmPaymentResponse = {
  accessToken?: unknown
  orderID?: unknown
}

const initializePaymentSchema = zod.object({
  cartId: zod.number(),
  cartSecret: zod.string().min(1).optional(),
  email: emailSchema,
  billingAddress: addressSchema,
  shippingAddress: zod.union([zod.object({ sameAsBilling: zod.literal(true) }), zod.object({ sameAsBilling: zod.literal(false), address: addressSchema })]),
})

const confirmPaymentSchema = zod.object({
  reference: zod.string().min(1).max(200).regex(/^[A-Za-z0-9.=-]+$/),
})

type InitiatePayment = NonNullable<PaymentAdapter['initiatePayment']>
type InitiatePaymentData = Parameters<InitiatePayment>[0]['data']

function getRelationID(value: number | { id: number } | null | undefined): number | undefined {
  if (typeof value === 'number') return value
  return value?.id
}

function toPaymentAddress(address: zod.infer<typeof addressSchema>): InitiatePaymentData['billingAddress'] {
  // The plugin types this transport value as a persisted Address, although its
  // adapters only consume the address fields and do not require document metadata.
  return address as unknown as InitiatePaymentData['billingAddress']
}

function toPaymentCart(cart: Cart, currency: string, subtotal: number): InitiatePaymentData['cart'] {
  // Payload's generated Cart permits nullable persisted fields while the
  // payment adapter accepts the same transport shape with normalized values.
  return {
    ...cart,
    currency,
    items: cart.items ?? [],
    subtotal,
  } as unknown as InitiatePaymentData['cart']
}

export async function initializePayment(args: InitializePaymentArgs): Promise<ActionResult<PaystackPaymentData>> {
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

  try {
    const req = await syntheticServerRequest()
    const payload = req.payload
    let cart = (await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 2,
      req,
    })) as Cart | null

    if (!cart) return { success: false, formError: 'Cart not found.' }

    const cartCustomerID = getRelationID(cart.customer)
    const canAccessCart =
      Boolean(req.user && cartCustomerID === req.user.id) ||
      Boolean(cartSecret && cart.secret && cartSecret === cart.secret)

    if (!canAccessCart) {
      return { success: false, formError: 'You do not have access to this cart.' }
    }

    if (cart.status === 'purchased' || cart.purchasedAt) {
      return { success: false, formError: 'This cart has already been purchased.' }
    }

    cart = (await payload.update({
      collection: 'carts',
      id: cart.id,
      data: {
        items: cart.items ?? [],
      },
      depth: 2,
      req,
    })) as Cart

    if (!cart.currency) {
      return { success: false, formError: "Something went wrong: we couldn't process the payment right now." }
    }

    if (typeof cart.subtotal !== 'number' || !Number.isSafeInteger(cart.subtotal) || cart.subtotal <= 0) {
      return { success: false, formError: 'Your cart has an invalid total.' }
    }

    const paymentCurrency = getPaymentAdapter(cart.currency)
    const paymentGateway = getPaymentGateway(paymentCurrency)

    if (!paymentGateway.initiatePayment) {
      return { success: false, formError: 'Selected payment method cannot initiate payments.' }
    }

    const paymentCart = toPaymentCart(cart, cart.currency, cart.subtotal)

    const paymentResult = await paymentGateway.initiatePayment({
      data: {
        billingAddress: toPaymentAddress(billingAddress),
        cart: paymentCart,
        currency: cart.currency,
        customerEmail: email,
        shippingAddress: toPaymentAddress(shippingAddress.sameAsBilling ? billingAddress : shippingAddress.address),
      },
      req,
      transactionsSlug: 'transactions',
    })

    const paystackResult = paymentResult as InitiatePaymentResponse

    if (
      typeof paystackResult.authorizationUrl !== 'string' ||
      typeof paystackResult.reference !== 'string' ||
      typeof paystackResult.accessCode !== 'string' ||
      (typeof paystackResult.transactionID !== 'string' && typeof paystackResult.transactionID !== 'number')
    ) {
      return { success: false, formError: 'Payment provider returned an invalid response.' }
    }

    return {
      success: true,
      data: {
        accessCode: paystackResult.accessCode,
        authorizationUrl: paystackResult.authorizationUrl,
        provider: 'paystack',
        reference: paystackResult.reference,
        transactionID: paystackResult.transactionID,
      },
    }
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : 'Unable to initialize payment.',
    }
  }
}

export async function confirmPaystackPayment(reference: string): Promise<ActionResult<PaystackConfirmationData>> {
  const parsedReference = confirmPaymentSchema.safeParse({ reference })
  if (!parsedReference.success) {
    return { success: false, formError: 'Invalid payment reference.' }
  }

  if (!paystackAdapter.confirmOrder) {
    return { success: false, formError: 'Paystack order confirmation is unavailable.' }
  }

  try {
    const result = (await paystackAdapter.confirmOrder({
      cartsSlug: 'carts',
      data: {
        reference: parsedReference.data.reference,
      },
      ordersSlug: 'orders',
      req: await syntheticServerRequest(),
      transactionsSlug: 'transactions',
    })) as ConfirmPaymentResponse

    if (typeof result.orderID !== 'string' && typeof result.orderID !== 'number') {
      return { success: false, formError: 'Payment provider returned an invalid order.' }
    }

    return {
      success: true,
      data: {
        orderID: result.orderID,
        ...(typeof result.accessToken === 'string' ? { accessToken: result.accessToken } : {}),
      },
    }
  } catch (error) {
    return {
      success: false,
      formError: error instanceof Error ? error.message : 'Unable to confirm payment.',
    }
  }
}

function getPaymentAdapter(_paymentCurrency: string): 'paystack' {
  const paymentCurrency = _paymentCurrency.toUpperCase()

  if (paymentCurrency === 'NGN') {
    return 'paystack'
  }

  throw new Error(`Unsupported payment currency: ${paymentCurrency}`)
}

function getPaymentGateway(paymentCurrency: 'paystack'): PaymentAdapter {
  if (paymentCurrency === 'paystack') {
    return paystackAdapter
  }

  throw new Error(`Unsupported payment gateway: ${paymentCurrency}`)
}
