import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

import { createPaystackClient } from './client'
import { createTransaction, getTransactionAPI } from '@/lib/api/transaction.api'

type Props = {
  apiBase: string
  callbackUrl: string
  referencePrefix: string
  requestTimeoutMs: number
  secretKey: string
}

type InitiatePayment = NonNullable<PaymentAdapter['initiatePayment']>

export const initiatePayment =
  ({ apiBase, callbackUrl, requestTimeoutMs, secretKey }: Props): InitiatePayment =>
  async ({
    data: {
      billingAddress,
      cart,
      currency,
      customerEmail,
      shippingAddress,
    },
    req,
  }) => {
    const { subtotal: totalAmount, id: cartId, ...cartDetails } = cart
    const cartSecret = 'secret' in cart && typeof cart.secret === 'string' ? cart.secret : undefined

    if (!billingAddress || !shippingAddress || !customerEmail || !totalAmount || totalAmount <= 0) {
      throw new Error('Missing required data for initiating payment')
    }

    try {
      const { initializePaymentRequest } = createPaystackClient({
        apiBase,
        requestTimeoutMs,
        secretKey,
      })

      const flattenedCart = cartDetails.items.map((item) => {
        const productID = typeof item.product === 'object' ? item.product.id : item.product
        const variantID = item.variant ? (typeof item.variant === 'object' ? item.variant.id : item.variant) : undefined

        // Preserve any additional custom properties (e.g., deliveryOption, customizations)
        // that may have been added via cartItemMatcher
        const { id: _id, product: _product, variant: _variant, ...customProperties } = item

        return {
          ...customProperties,
          product: productID,
          quantity: item.quantity,
          ...(variantID ? { variant: variantID } : {}),
        }
      })

      const paymentResult = await initializePaymentRequest({
        amount: totalAmount,
        callback_url: callbackUrl,
        currency: currency as 'NGN',
        email: customerEmail,
        metadata: JSON.stringify({
          cart_id: cartId,
          cartItemSnapShot: flattenedCart,
          ...(cartSecret ? { cartSecret } : {}),
          shippingAddress,
          custom_fields: [
            {
              display_name: 'Cart ID',
              value: String(cartId),
              variable_name: 'cart_id',
            },
          ],
        }),
      })

      if (!paymentResult.ok) {
        throw new Error(paymentResult.error.message)
      }
      const {
        data: { access_code, authorization_url, reference },
        message,
      } = paymentResult.value.data

      const transactionResult = await createTransaction({
        data: {
          ...(req.user ? { customer: req.user.id } : { customerEmail }),
          amount: totalAmount,
          billingAddress,
          cart: cartId,
          currency: currency as 'NGN',
          items: flattenedCart,
          paymentMethod: 'paystack',
          paystack: {
            accessCode: access_code,
            authorizationUrl: authorization_url,
            reference,
          },
          status: 'pending',
        },
        req,
      })

      if ('reason' in transactionResult) {
        throw new Error(transactionResult.message)
      }

      return {
        message: message ?? paymentResult.value.message ?? 'Paystack payment initiated',
        accessCode: access_code,
        authorizationUrl: authorization_url,
        reference,
      }
    } catch (error) {
      req.payload.logger.error({
        err: error,
        msg: 'Error initiating payment with Paystack',
      })

      throw new Error(error instanceof Error ? error.message : 'Unable to initiate payment with Paystack.')
    }
  }
