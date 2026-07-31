import zod from 'zod'

export const paystackInitiateResultSchema = zod.object({
  authorizationUrl: zod.url(),
  message: zod.string(),
  reference: zod.string(),
})

export const paystackConfirmOrderResultSchema = zod.object({
  accessToken: zod.string().min(1).optional(),
  email: zod.email().optional(),
  message: zod.string().min(1),
  orderID: zod.number().int().positive(),
  transactionID: zod.number().int().positive(),
})

export type PaystackConfirmOrderResult = zod.infer<typeof paystackConfirmOrderResultSchema>
