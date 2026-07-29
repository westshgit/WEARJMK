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

type InitiatePayment = NonNullable<PaymentAdapter['initiatePayment']>
type InitiatePaymentData = Parameters<InitiatePayment>[0]['data']
type TransactionAddress = NonNullable<Transaction['billingAddress']>
type TransactionItems = NonNullable<Transaction['items']>

function generateReference(cartID: string, prefix: string): string {
  return `${prefix}-${cartID}-${crypto.randomUUID()}`
}

function normalizeAddress(address: InitiatePaymentData['billingAddress']): TransactionAddress {
  return {
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    company: address.company,
    country: address.country,
    firstName: address.firstName,
    lastName: address.lastName,
    phone: address.phone,
    postalCode: address.postalCode,
    state: address.state,
    title: address.title,
  }
}

function normalizeItems(items: InitiatePaymentData['cart']['items']): TransactionItems {
  return items.map((item) => ({
    ...(item.id ? { id: item.id } : {}),
    product: typeof item.product === 'object' ? item.product.id : item.product,
    quantity: item.quantity,
    ...(item.variant
      ? {
          variant: typeof item.variant === 'object' ? item.variant.id : item.variant,
        }
      : {}),
  }))
}

export const initiatePayment =
  ({ apiBase, callbackUrl, referencePrefix, requestTimeoutMs, secretKey }: Props): InitiatePayment =>
  async ({ data, req, transactionsSlug = 'transactions' }) => {
    const { billingAddress, cart, customerEmail, shippingAddress } = data
    const currency = data.currency.toUpperCase()
    const amount = cart?.subtotal

    if (!cart?.items?.length) {
      throw new Error('Cart is empty or not provided.')
    }

    if (!customerEmail || typeof customerEmail !== 'string') {
      throw new Error('A valid customer email is required to make a purchase.')
    }

    if (typeof amount !== 'number' || !Number.isSafeInteger(amount) || amount <= 0) {
      throw new Error('A valid amount is required to initiate a payment.')
    }

    if (currency !== 'NGN') {
      throw new Error(`Paystack does not support the selected currency: ${currency}.`)
    }

    const items = normalizeItems(cart.items)
    const reference = generateReference(String(cart.id), referencePrefix)
    const normalizedShippingAddress = shippingAddress ? normalizeAddress(shippingAddress) : undefined

    try {
      const initializedPayment = await createPaystackClient({
        apiBase,
        requestTimeoutMs,
        secretKey,
      }).initialize({
        amount,
        callback_url: callbackUrl,
        currency,
        email: customerEmail,
        metadata: JSON.stringify({
          cart_id: String(cart.id),
          cart_items_snapshot: JSON.stringify(items),
          customer_email: customerEmail,
          shipping_address: normalizedShippingAddress ? JSON.stringify(normalizedShippingAddress) : undefined,
          custom_fields: [
            {
              display_name: 'Cart ID',
              value: String(cart.id),
              variable_name: 'cart_id',
            },
          ],
        }),
        reference,
      })

      await req.payload.create({
        collection: transactionsSlug as 'transactions',
        data: {
          ...(req.user ? { customer: req.user.id } : { customerEmail }),
          amount,
          billingAddress: normalizeAddress(billingAddress),
          cart: cart.id,
          currency,
          items,
          paymentMethod: 'paystack',
          paystack: {
            accessCode: initializedPayment.access_code,
            authorizationUrl: initializedPayment.authorization_url,
            reference: initializedPayment.reference,
          },
          status: 'pending',
        },
        req,
      })

      return {
        accessCode: initializedPayment.access_code,
        authorizationUrl: initializedPayment.authorization_url,
        message: 'Payment initiated successfully.',
        reference: initializedPayment.reference,
      }
    } catch (error) {
      req.payload.logger.error({
        err: error,
        msg: 'Error initiating payment with Paystack',
      })

      throw new Error(error instanceof Error ? error.message : 'Unable to initiate payment with Paystack.')
    }
  }
