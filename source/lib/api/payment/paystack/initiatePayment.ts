import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

import type { Transaction } from '@/payload-types'
import { createPaystackClient } from './client'

type Props = {
  apiBase: string
  callbackUrl: string
  referencePrefix: string
  requestTimeoutMs: number
  secretKey: string
}

type PaystackTransaction = Transaction & {
  paystack?: Transaction['paystack'] & {
    authorizationUrl?: string | null
  }
}

const generateReference = (cartID: string, prefix: string): string => {
  return `${prefix}-${cartID}-${crypto.randomUUID()}`
}

export const initiatePayment =
  (props: Props): NonNullable<PaymentAdapter>['initiatePayment'] =>
  async ({ data, req, transactionsSlug }: Parameters<NonNullable<PaymentAdapter>['initiatePayment']>[0] & { transaction?: Transaction }) => {
    const payload = req.payload
    const { secretKey } = props

    const customerEmail = data.customerEmail
    const currency = data.currency
    const cart = data.cart
    const amount = cart.subtotal
    const billingAddressFromData = data.billingAddress
    const shippingAddressFromData = data.shippingAddress

    if (!secretKey) {
      throw new Error('Paystack secret key is required.')
    }
    if (!currency || currency.toUpperCase() !== 'NGN') {
      throw new Error('Currency is required and must be NGN.')
    }
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty or not provided.')
    }
    if (!customerEmail || typeof customerEmail !== 'string') {
      throw new Error('A valid customer email is required to make a purchase.')
    }
    if (typeof amount !== 'number' || !Number.isSafeInteger(amount) || amount <= 0) {
      throw new Error('A valid amount is required to initiate a payment.')
    }

    const flattenedCart = cart.items.map((item) => {
      const productID = typeof item.product === 'object' ? item.product.id : item.product
      const variantID = item.variant ? (typeof item.variant === 'object' ? item.variant.id : item.variant) : undefined
      const { product: _product, variant: _variant, ...customProperties } = item

      return {
        ...customProperties,
        product: productID,
        quantity: item.quantity,
        ...(variantID
          ? {
              variant: variantID,
            }
          : {}),
      }
    })

    const existingTransactions = await payload.find({
      collection: transactionsSlug as 'transactions',
      limit: 1,
      req,
      sort: '-createdAt',
      where: {
        and: [
          { cart: { equals: cart.id } },
          { paymentMethod: { equals: 'paystack' } },
          { status: { in: ['pending', 'succeeded'] } },
        ],
      },
    })

    const existingTransaction = existingTransactions.docs[0] as PaystackTransaction | undefined
    if (existingTransaction?.status === 'succeeded') {
      throw new Error('This cart has already been paid for.')
    }

    if (existingTransaction?.status === 'pending') {
      if (existingTransaction.amount !== amount || existingTransaction.currency !== currency.toUpperCase()) {
        throw new Error('This cart already has a pending payment for a different total.')
      }

      if (
        existingTransaction.paystack?.reference &&
        existingTransaction.paystack.accessCode &&
        existingTransaction.paystack.authorizationUrl
      ) {
        return {
          message: 'Existing payment session returned',
          reference: existingTransaction.paystack.reference,
          authorizationUrl: existingTransaction.paystack.authorizationUrl,
          accessCode: existingTransaction.paystack.accessCode,
          transactionID: existingTransaction.id,
        }
      }

      throw new Error('This cart already has a pending payment.')
    }

    const reference = generateReference(String(cart.id), props.referencePrefix)
    const paystack = createPaystackClient({
      apiBase: props.apiBase,
      requestTimeoutMs: props.requestTimeoutMs,
      secretKey,
    })

    try {
      const initialized = await paystack.initialize({
        email: customerEmail,
        amount,
        currency,
        reference,
        callback_url: props.callbackUrl,
        metadata: JSON.stringify({
          cart_id: String(cart.id),
          cart_items_snapshot: JSON.stringify(flattenedCart),
          customer_email: customerEmail,
          shipping_address: shippingAddressFromData ? JSON.stringify(shippingAddressFromData) : undefined,
          custom_fields: [{ display_name: 'Cart ID', variable_name: 'cart_id', value: String(cart.id) }],
        }),
      })

      const transactionData = {
        ...(req.user ? { customer: req.user.id } : { customerEmail }),
        amount,
        billingAddress: billingAddressFromData,
        cart: cart.id,
        currency: currency.toUpperCase() as 'NGN',
        items: flattenedCart,
        paymentMethod: 'paystack' as const,
        status: 'pending' as const,
        paystack: {
          reference: initialized.reference,
          accessCode: initialized.access_code,
          authorizationUrl: initialized.authorization_url,
        },
      }

      const transaction = await payload.create({
        collection: transactionsSlug as 'transactions',
        data: transactionData,
        req,
      })

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
      throw new Error(error instanceof Error ? error.message : 'Unknown error initiating payment')
    }
  }
