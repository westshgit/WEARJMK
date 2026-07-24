'use server'
import { ActionResult } from '../shared'
import { Address, Cart } from '@/payload-types'
import { paystackAdapter } from './payment/paystack/paystackAdapter'
import { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import zod from 'zod'
import { emailSchema } from '../schema/authentication'
import { addressSchema } from '../schema/address'
import { flattenZodErrors } from '../schema'
import { getCartById } from './cart.api'
import { getUserTransactionByCartId } from './transaction.api'

export interface InitializePaymentArgs {
  cart: Cart
  email: string
  billingAddress: Address
  shippingAddress:
    | {
        sameAsBilling: true
      }
    | {
        sameAsBilling: false
        address: Address
      }
}

const initializePaymentSchema = zod.object({
  // if id is valid we don't trust cart currency and instead use the cart currency from the database to ensure that the payment gateway is always correct.
  cartId: zod.number(),
  email: emailSchema,
  billingAddress: addressSchema,
  shippingAddress: zod.union([zod.object({ sameAsBilling: zod.literal(true) }), zod.object({ sameAsBilling: zod.literal(false), address: addressSchema })]),
})

export async function initializePayment(args: InitializePaymentArgs): Promise<ActionResult<string | 'paystack'>> {
  console.dir(args, { depth: 3 })
  const parsedArgs = initializePaymentSchema.safeParse({
    cartId: args.cart.id,
    cartCurrency: args.cart.currency,
    email: args.email,
    billingAddress: args.billingAddress,
    shippingAddress: args.shippingAddress,
  })
  if (!parsedArgs.success) {
    return {
      success: false,
      formError: 'Invalid DATA',
      fieldErrors: flattenZodErrors(parsedArgs.error),
    }
  }
  const { cartId, email, billingAddress, shippingAddress } = parsedArgs.data
  const cart = await getCartById(cartId)
  if (!cart) return { success: false, formError: 'Cart not found' }
  if (!cart.currency) return { success: false, formError: "Something went wrong: we couldn't process the payment right now" }

  const existingTransaction = await getUserTransactionByCartId(cartId, email)

  // Transaction already exists for this cart and user, we can skip the payment gateway initiation and return a success response.
  if (
    existingTransaction &&
    existingTransaction.status !== 'succeeded' &&
    existingTransaction.status !== 'expired' &&
    existingTransaction.status !== 'refunded'
  ) {
    // Yes the transaction exists and in a state that allows for payment processing, we can return a success response.
    // for them to continue
    return { success: true, data: 'paystack' }
  }

  // Here we will continue to initiate the payment if the previous transaction was succesful we wanna warn the user that they have already paid for this cart and they should check their email for the receipt or contact support if they have any issues.
  // Trust cart.currency from DB, not client-supplied cartCurrency
  const paymentCurrency = getPaymentAdapter(cart.currency)
  const _paymentGateway = getPaymentGateway(paymentCurrency)

  // Check if the cart has been processed for payment already. If so, we can skip the payment gateway initiation and return a success response.
  // for that to confirm the order
  // The order must be in a state that allows for payment processing (e.g., not already paid or completed).
  // else we continue to initiate the payment gateway

  // const paymentResult = await _paymentGateway.initiatePayment({
  //   cart,
  //   email,
  //   billingAddress,
  //   shippingAddress,
  // })

  // const paymentResult = await _paymentGateway.initiatePayment({
  //   cart,
  //   email,
  //   billingAddress,
  //   shippingAddress,
  // })

  return { success: true, data: 'paystack' }
}

function getPaymentAdapter(_paymentCurrency: string): 'stripe' | 'paystack' {
  // This is just a bulletproof way to ensure that the payment currency is always in uppercase, regardless of how it's passed in.
  const paymentCurrency = _paymentCurrency.toUpperCase()
  if (paymentCurrency === 'USD' || paymentCurrency === 'EUR') {
    return 'stripe'
  }

  if (paymentCurrency === 'NGN') {
    return 'paystack'
  }

  throw new Error(`Unsupported payment currency: ${paymentCurrency}`)
}

function getPaymentGateway(paymentCurrency: 'stripe' | 'paystack'): PaymentAdapter {
  // if (paymentCurrency === 'stripe') {
  //   return stripeAdapter
  if (paymentCurrency === 'paystack') {
    return paystackAdapter
  }
  throw new Error(`Unsupported payment gateway: ${paymentCurrency}`)
}
