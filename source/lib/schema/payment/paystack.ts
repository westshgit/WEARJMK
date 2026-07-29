import zod from 'zod'

export const paystackInitiateResultSchema = zod.object({
  authorizationUrl: zod.url(),
  message: zod.string(),
  reference: zod.string(),
})
