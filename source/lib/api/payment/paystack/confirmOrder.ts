import type { Order } from '@/payload-types'
import { paystackConfirmOrderResultSchema } from '@/lib/schema/payment/paystack'
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import { z } from 'zod'

import { createPaystackClient } from './client'
import { getTransactionAPI } from '../../transaction.api'
import { getOrdersAPI } from '../../order.api'

type Props = {
  apiBase: string
  requestTimeoutMs: number
  secretKey: string
}

const paymentReferenceSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[A-Za-z0-9.=-]+$/)

const paystackMetadataSchema = z.object({
  cart_id: z.union([z.number().int().positive(), z.string().trim().regex(/^\d+$/)]),
  cartSecret: z.string().min(1).optional(),
  cartItemSnapShot: z
    .array(
      z.object({
        product: z.number().int().positive(),
        quantity: z.number().int().positive(),
        variant: z.number().int().positive().optional(),
      }),
    )
    .min(1),
  shippingAddress: z.object({
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    company: z.string().optional(),
    country: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    postalCode: z.string(),
    state: z.string(),
    title: z.string(),
  }),
})

function parsePaystackMetadata(metadata: unknown) {
  let parsedMetadata = metadata

  if (typeof metadata === 'string') {
    try {
      parsedMetadata = JSON.parse(metadata) as unknown
    } catch {
      throw new Error('Paystack returned invalid transaction metadata.')
    }
  }

  const result = paystackMetadataSchema.safeParse(parsedMetadata)

  if (!result.success) {
    throw new Error('Paystack returned incomplete transaction metadata.')
  }

  return result.data
}

export const confirmOrder =
  ({ apiBase, requestTimeoutMs, secretKey }: Props): NonNullable<PaymentAdapter['confirmOrder']> =>
  async ({ data, req, transactionsSlug = 'transactions', cartsSlug = 'carts', ordersSlug = 'orders' }) => {
    const payload = req.payload

    try {
      const parsedReference = paymentReferenceSchema.safeParse(data.reference)

      if (!parsedReference.success) {
        throw new Error('A valid Paystack payment reference is required.')
      }

      const paymentReference = parsedReference.data
      const transactionsResult = await getTransactionAPI({
        req,
        where: {
          'paystack.reference': {
            equals: paymentReference,
          },
        },
      })
      const transaction = transactionsResult?.[0]

      if (!transaction) {
        throw new Error('No transaction found for the provided Paystack reference.')
      }

      const { confirmPaymentRequest } = createPaystackClient({
        apiBase,
        requestTimeoutMs,
        secretKey,
      })
      const verificationResult = await confirmPaymentRequest(paymentReference)

      if (!verificationResult.ok) {
        throw new Error(verificationResult.error.message)
      }

      const verifiedPayment = verificationResult.value.data.data

      if (verifiedPayment.status !== 'success') {
        throw new Error('Payment has not been completed.')
      }

      if (verifiedPayment.reference !== paymentReference) {
        throw new Error('Paystack returned a different payment reference.')
      }

      if (transaction.amount === null || transaction.amount === undefined || verifiedPayment.amount !== transaction.amount) {
        throw new Error('The verified payment amount does not match the transaction.')
      }

      const verifiedCurrency = verifiedPayment.currency.toUpperCase()

      if (verifiedCurrency !== 'NGN' || verifiedCurrency !== transaction.currency) {
        throw new Error('The verified payment currency does not match the transaction.')
      }

      const metadata = parsePaystackMetadata(verifiedPayment.metadata)
      const cartID = typeof metadata.cart_id === 'string' ? Number(metadata.cart_id) : metadata.cart_id

      if (!Number.isSafeInteger(cartID) || cartID <= 0) {
        throw new Error('Paystack returned an invalid cart ID.')
      }

      const transactionCartID = typeof transaction.cart === 'object' ? transaction.cart?.id : transaction.cart

      if (!transactionCartID || transactionCartID !== cartID) {
        throw new Error('The verified cart does not match the transaction.')
      }

      const customerID = typeof transaction.customer === 'object' ? transaction.customer?.id : transaction.customer
      const customerEmail = transaction.customerEmail ?? verifiedPayment.customer?.email

      if (!customerID && !customerEmail) {
        throw new Error('No customer was found for this transaction.')
      }

      if (!customerID && !metadata.cartSecret) {
        throw new Error('The guest cart secret is missing from the verified payment metadata.')
      }

      const cartRequest = metadata.cartSecret
        ? {
            ...req,
            context: {
              ...req.context,
              cartSecret: metadata.cartSecret,
            },
          }
        : req
      const timestamp = new Date().toISOString()
      const clearPurchasedCart = () =>
        payload.update({
          id: cartID,
          collection: cartsSlug as 'carts',
          data: {
            items: [],
            purchasedAt: timestamp,
            status: 'purchased',
          },
          overrideAccess: false,
          req: cartRequest,
        })

      if (transaction.status === 'succeeded' && transaction.order) {
        const orderID = typeof transaction.order === 'object' ? transaction.order.id : transaction.order
        const existingOrderResult = await getOrdersAPI({
          req,
          where: {
            id: {
              equals: orderID,
            },
          },
        })
        const existingOrder = existingOrderResult[0]

        if (!existingOrder) {
          throw new Error("Transaction marked successful, but couldn't process your order, please contact support!")
        }

        await clearPurchasedCart()

        return paystackConfirmOrderResultSchema.parse({
          message: 'Paystack order already confirmed.',
          orderID: existingOrder.id,
          transactionID: transaction.id,
          ...(existingOrder.accessToken ? { accessToken: existingOrder.accessToken } : {}),
          ...(existingOrder.customerEmail ? { email: existingOrder.customerEmail } : {}),
        })
      }

      const order = await payload.create({
        collection: ordersSlug as 'orders',
        data: {
          amount: verifiedPayment.amount,
          currency: verifiedCurrency,
          ...(customerID ? { customer: customerID } : { customerEmail }),
          items: metadata.cartItemSnapShot,
          paymentReference,
          shippingAddress: metadata.shippingAddress as Order['shippingAddress'],
          status: 'processing',
          transactions: [transaction.id],
        },
        req,
      })

      await Promise.all([
        clearPurchasedCart(),
        payload.update({
          id: transaction.id,
          collection: transactionsSlug as 'transactions',
          data: {
            order: order.id,
            status: 'succeeded',
          },
          req,
        }),
      ])

      return paystackConfirmOrderResultSchema.parse({
        message: 'Paystack order confirmed successfully.',
        orderID: order.id,
        transactionID: transaction.id,
        ...(order.accessToken ? { accessToken: order.accessToken } : {}),
        ...(!customerID && customerEmail ? { email: customerEmail } : {}),
      })
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: 'Error confirming order with Paystack',
      })

      throw new Error(error instanceof Error ? error.message : 'Unable to confirm the Paystack order.')
    }
  }
