import type { Access, Where } from 'payload'
import { z } from 'zod'

export const GUEST_ORDER_ACCESS_CONTEXT = 'guestOrderAccess'

export const guestOrderCredentialsSchema = z.object({
  accessToken: z.uuid(),
  email: z.string().trim().toLowerCase().pipe(z.email()),
})

export const guestOrderAccess: Access = ({ req }) => {
  const credentials = guestOrderCredentialsSchema.safeParse(req.context?.[GUEST_ORDER_ACCESS_CONTEXT])

  if (!credentials.success) {
    return false
  }

  const guestOrderWhere: Where = {
    and: [
      {
        accessToken: {
          equals: credentials.data.accessToken,
        },
      },
      {
        customerEmail: {
          equals: credentials.data.email,
        },
      },
    ],
  }

  return guestOrderWhere
}
