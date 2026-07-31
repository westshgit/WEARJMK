import type { Order } from '@/payload-types'
import { paystackConfirmOrderResultSchema } from '@/lib/schema/payment/paystack'
import type { PaystackConfirmOrderResult } from '@/lib/schema/payment/paystack'
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import type { PayloadRequest } from 'payload'
import { z } from 'zod'

import { createPaystackClient } from './client'

type Props = {
  apiBase: string
  requestTimeoutMs: number
  secretKey: string
}

type ConfirmPaystackOrderArgs = Props & {
  cartsSlug?: string
  ordersSlug?: string
  reference: string
  req: PayloadRequest
  transactionsSlug?: string
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

export async function confirmPaystackOrder({
  apiBase,
  cartsSlug = 'carts',
  ordersSlug = 'orders',
  reference,
  req,
  requestTimeoutMs,
  secretKey,
  transactionsSlug = 'transactions',
}: ConfirmPaystackOrderArgs): Promise<PaystackConfirmOrderResult> {
  const payload = req.payload

  try {
    const parsedReference = paymentReferenceSchema.safeParse(reference)

    if (!parsedReference.success) {
      throw new Error('A valid Paystack payment reference is required.')
    }

    const paymentReference = parsedReference.data
    const transactionsResult = await payload.find({
      collection: transactionsSlug as 'transactions',
      limit: 1,
      overrideAccess: true,
      req,
      where: {
        'paystack.reference': {
          equals: paymentReference,
        },
      },
    })
    const transaction = transactionsResult.docs[0]

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

    const timestamp = new Date().toISOString()
    const markCartPurchased = () =>
      payload.update({
        id: cartID,
        collection: cartsSlug as 'carts',
        data: {
          items: [],
          purchasedAt: timestamp,
          status: 'purchased',
        },
        overrideAccess: true,
        req,
      })
    const updateTransaction = (orderID: number) =>
      payload.update({
        id: transaction.id,
        collection: transactionsSlug as 'transactions',
        data: {
          order: orderID,
          status: 'succeeded',
        },
        overrideAccess: true,
        req,
      })
    const findExistingOrder = async () => {
      const transactionOrderID = transaction.order && typeof transaction.order === 'object' ? transaction.order.id : transaction.order

      if (transactionOrderID) {
        try {
          return await payload.findByID({
            id: transactionOrderID,
            collection: ordersSlug as 'orders',
            overrideAccess: true,
            req,
          })
        } catch {
          // Fall through to the unique payment reference lookup.
        }
      }

      const result = await payload.find({
        collection: ordersSlug as 'orders',
        limit: 1,
        overrideAccess: true,
        req,
        where: {
          paymentReference: {
            equals: paymentReference,
          },
        },
      })

      return result.docs[0]
    }

    let order = await findExistingOrder()
    let alreadyConfirmed = Boolean(order)

    if (!order) {
      try {
        order = await payload.create({
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
          overrideAccess: true,
          req,
        })
      } catch (error) {
        order = await findExistingOrder()

        if (!order) {
          throw error
        }

        alreadyConfirmed = true
      }
    }

    await Promise.all([markCartPurchased(), updateTransaction(order.id)])

    return paystackConfirmOrderResultSchema.parse({
      message: alreadyConfirmed ? 'Paystack order already confirmed.' : 'Paystack order confirmed successfully.',
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

export const confirmOrder =
  ({ apiBase, requestTimeoutMs, secretKey }: Props): NonNullable<PaymentAdapter['confirmOrder']> =>
  ({ cartsSlug = 'carts', data, ordersSlug = 'orders', req, transactionsSlug = 'transactions' }) =>
    confirmPaystackOrder({
      apiBase,
      cartsSlug,
      ordersSlug,
      reference: data.reference,
      req,
      requestTimeoutMs,
      secretKey,
      transactionsSlug,
    })
