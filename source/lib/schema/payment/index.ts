import zod from 'zod'
import { emailSchema } from '../authentication'
import { addressSchema } from '../address'

export const initializePaymentSchema = zod.object({
  cartId: zod.number(),
  cartSecret: zod.string().min(1).optional(),
  email: emailSchema,
  billingAddress: addressSchema,
  shippingAddress: zod.union([zod.object({ sameAsBilling: zod.literal(true) }), zod.object({ sameAsBilling: zod.literal(false), address: addressSchema })]),
})

export const confirmPaymentSchema = zod.object({
  reference: zod
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9.=-]+$/),
})
