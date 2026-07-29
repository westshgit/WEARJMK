import { addressSchema } from '@/lib/schema/address'
import { Cart } from '@/payload-types'
import zod from 'zod'
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

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

export type InitializePaymentResult = NonNullable<Awaited<ReturnType<PaymentAdapter['initiatePayment']>>>

export type PaymentInitiatePayment = NonNullable<PaymentAdapter['initiatePayment']>
export type PaymentInitiatePaymentData = Parameters<PaymentInitiatePayment>[0]['data']

export type ConfirmPaystackPaymentResult = {
  accessToken?: string
  orderID: number
}
