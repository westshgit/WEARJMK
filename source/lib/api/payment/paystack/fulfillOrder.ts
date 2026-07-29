import type { Cart, Order, Transaction } from '@/payload-types'
import type { DefaultDocumentIDType, PayloadRequest } from 'payload'

import type { PaystackTransactionData } from './types'

type CollectionSlugs = {
  cartsSlug?: string
  ordersSlug?: string
  productsSlug?: string
  transactionsSlug?: string
  variantsSlug?: string
}

type FulfillPaystackOrderArgs = CollectionSlugs & {
  customerEmail?: string
  decrementInventory?: boolean
  req: PayloadRequest
  transactionData: PaystackTransactionData
}

type FulfillPaystackOrderResult = {
  created: boolean
  order: Order
  transaction: Transaction
}

type CartItem = NonNullable<Transaction['items']>[number]
type Address = NonNullable<Order['shippingAddress']>

function getRelationID(value: number | { id: number } | null | undefined): number | undefined {
  if (typeof value === 'number') return value
  return value?.id
}

function parseMetadataRecord(metadata: unknown): Record<string, unknown> {
  if (typeof metadata === 'object' && metadata !== null) return metadata
  return parseJSONField<Record<string, unknown>>(metadata) ?? {}
}

function parseJSONField<T>(value: unknown): T | undefined {
  if (typeof value !== 'string') return undefined

  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

function isPositiveAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

async function reconcileExistingOrder({
  amount,
  currency,
  order,
  ordersSlug,
  req,
}: {
  amount: number
  currency: 'NGN'
  order: Order
  ordersSlug: string
  req: PayloadRequest
}): Promise<Order> {
  if (isPositiveAmount(order.amount) && order.amount !== amount) {
    throw new Error('Existing order amount does not match the verified Paystack amount')
  }

  if (order.currency && order.currency !== currency) {
    throw new Error('Existing order currency does not match the verified Paystack currency')
  }

  if (order.amount === amount && order.currency === currency) return order

  return req.payload.update({
    collection: ordersSlug as 'orders',
    id: order.id,
    data: {
      amount,
      currency,
    },
    req,
  })
}

async function decrementInventory({
  items,
  productsSlug,
  req,
  variantsSlug,
}: {
  items: CartItem[]
  productsSlug: string
  req: PayloadRequest
  variantsSlug: string
}) {
  for (const item of items) {
    const quantity = item.quantity || 1

    if (item.variant) {
      const id = getRelationID(item.variant)
      if (!id) continue

      await req.payload.db.updateOne({
        id,
        collection: variantsSlug as 'variants',
        data: {
          inventory: {
            $inc: quantity * -1,
          },
        },
      })
    } else if (item.product) {
      const id = getRelationID(item.product)
      if (!id) continue

      await req.payload.db.updateOne({
        id,
        collection: productsSlug as 'products',
        data: {
          inventory: {
            $inc: quantity * -1,
          },
        },
      })
    }
  }
}

export async function fulfillPaystackOrder({
  cartsSlug = 'carts',
  customerEmail,
  decrementInventory: shouldDecrementInventory = false,
  ordersSlug = 'orders',
  productsSlug = 'products',
  req,
  transactionData,
  transactionsSlug = 'transactions',
  variantsSlug = 'variants',
}: FulfillPaystackOrderArgs): Promise<FulfillPaystackOrderResult> {
  if (transactionData.status !== 'success') {
    throw new Error(`Payment not completed. Status: ${transactionData.status}`)
  }

  const transactions = await req.payload.find({
    collection: transactionsSlug as 'transactions',
    limit: 1,
    req,
    where: {
      'paystack.reference': { equals: transactionData.reference },
    },
  })

  const transaction = transactions.docs[0]
  if (!transaction) {
    throw new Error('No transaction found for the provided Paystack reference')
  }

  if (!isPositiveAmount(transactionData.amount)) {
    throw new Error('Paystack returned an invalid transaction amount')
  }

  if (!isPositiveAmount(transaction.amount) || transaction.amount !== transactionData.amount) {
    throw new Error('Verified Paystack amount does not match the stored transaction amount')
  }

  const verifiedCurrency = transactionData.currency.toUpperCase()
  if (verifiedCurrency !== 'NGN' || transaction.currency !== verifiedCurrency) {
    throw new Error('Verified Paystack currency does not match the stored transaction currency')
  }

  if (
    transaction.customerEmail &&
    transactionData.customer?.email &&
    transaction.customerEmail.toLowerCase() !== transactionData.customer.email.toLowerCase()
  ) {
    throw new Error('Verified Paystack customer does not match the stored transaction customer')
  }

  if (transaction.order) {
    const orderID = getRelationID(transaction.order)
    if (!orderID) {
      throw new Error('Transaction contains an invalid order relationship')
    }

    const existingOrder = await req.payload.findByID({
      collection: ordersSlug as 'orders',
      id: orderID,
      req,
    })

    return {
      created: false,
      order: await reconcileExistingOrder({
        amount: transactionData.amount,
        currency: verifiedCurrency,
        order: existingOrder,
        ordersSlug,
        req,
      }),
      transaction,
    }
  }

  const existingOrderResult = await req.payload.find({
    collection: ordersSlug as 'orders',
    limit: 1,
    req,
    where: {
      or: [
        { transactions: { equals: transaction.id } },
        { paymentReference: { equals: transactionData.reference } },
      ],
    },
  })

  const existingOrder = existingOrderResult.docs[0]
  if (existingOrder) {
    const reconciledOrder = await reconcileExistingOrder({
      amount: transactionData.amount,
      currency: verifiedCurrency,
      order: existingOrder,
      ordersSlug,
      req,
    })

    await req.payload.update({
      collection: transactionsSlug as 'transactions',
      id: transaction.id,
      data: { order: reconciledOrder.id, status: 'succeeded' },
      req,
    })

    return {
      created: false,
      order: reconciledOrder,
      transaction: { ...transaction, order: reconciledOrder.id, status: 'succeeded' },
    }
  }

  const metadata = parseMetadataRecord(transactionData.metadata)
  const cartID = (metadata.cart_id as string | undefined) ?? String(getRelationID(transaction.cart) ?? '')
  const shippingAddress = parseJSONField<Address>(metadata.shipping_address)
  const items = transaction.items ?? []

  if (!cartID) {
    throw new Error('Cart ID not found for the Paystack transaction')
  }

  if (!items.length) {
    throw new Error('Transaction items are missing')
  }

  const orderData = {
    amount: transactionData.amount,
    currency: verifiedCurrency,
    ...(transaction.customer ? { customer: getRelationID(transaction.customer) } : {}),
    ...(transaction.customerEmail || customerEmail ? { customerEmail: transaction.customerEmail || customerEmail } : {}),
    items,
    paymentReference: transactionData.reference,
    shippingAddress: shippingAddress ?? transaction.billingAddress,
    status: 'processing' as const,
    transactions: [transaction.id],
  }

  let created = true
  let order: Order

  try {
    order = await req.payload.create({
      collection: ordersSlug as 'orders',
      data: orderData,
      req,
    })
  } catch (error) {
    const concurrentOrderResult = await req.payload.find({
      collection: ordersSlug as 'orders',
      limit: 1,
      req,
      where: {
        paymentReference: { equals: transactionData.reference },
      },
    })
    const concurrentOrder = concurrentOrderResult.docs[0]

    if (!concurrentOrder) throw error

    created = false
    order = await reconcileExistingOrder({
      amount: transactionData.amount,
      currency: verifiedCurrency,
      order: concurrentOrder,
      ordersSlug,
      req,
    })
  }

  await req.payload.update({
    collection: cartsSlug as 'carts',
    id: cartID as DefaultDocumentIDType,
    data: { purchasedAt: new Date().toISOString(), status: 'purchased' } satisfies Partial<Cart>,
    req,
  })

  const updatedTransaction = await req.payload.update({
    collection: transactionsSlug as 'transactions',
    id: transaction.id,
    data: { order: order.id, status: 'succeeded' },
    req,
  })

  if (shouldDecrementInventory && created) {
    await decrementInventory({
      items,
      productsSlug,
      req,
      variantsSlug,
    })
  }

  return {
    created,
    order,
    transaction: updatedTransaction,
  }
}

export async function markPaystackTransactionFailed({
  reference,
  req,
  transactionsSlug = 'transactions',
}: {
  reference: string
  req: PayloadRequest
  transactionsSlug?: string
}) {
  const transactions = await req.payload.find({
    collection: transactionsSlug as 'transactions',
    limit: 1,
    req,
    where: {
      'paystack.reference': { equals: reference },
    },
  })

  const transaction = transactions.docs[0]
  if (!transaction || transaction.status === 'succeeded') return

  await req.payload.update({
    collection: transactionsSlug as 'transactions',
    id: transaction.id,
    data: { status: 'failed' },
    req,
  })
}
