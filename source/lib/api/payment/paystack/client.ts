import { z } from 'zod'

type PaystackClientArgs = {
  apiBase: string
  requestTimeoutMs?: number
  secretKey: string
}

type InitializeTransactionArgs = {
  amount: number
  callback_url: string
  currency: 'NGN'
  email: string
  metadata: string
  reference?: string
}

const PaystackInitializeDataSchema = z.object({
  authorization_url: z.url(),
  access_code: z.string().min(1),
  reference: z.string().min(1),
})

const PaystackConfirmDataSchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.string().min(1),
  customer: z
    .object({
      email: z.email(),
      id: z.number().int(),
    })
    .optional(),
  metadata: z.union([z.record(z.string(), z.unknown()), z.string(), z.null()]).optional(),
  reference: z.string().min(1),
  status: z.string().min(1),
})

const PaystackInitializeResponseBodySchema = z.object({
  status: z.boolean(),
  message: z.string().optional(),
  data: PaystackInitializeDataSchema,
})

const PaystackConfirmPaymentResponseBodySchema = z.object({
  status: z.literal(true),
  message: z.string().optional(),
  data: PaystackConfirmDataSchema,
})

function createPaystackEnvelopeSchema<TSchema extends z.ZodType>(dataSchema: TSchema) {
  return z.object({
    status: z.number().int().min(200).max(299),
    data: dataSchema,
    message: z.string().optional(),
  })
}

export const PaystackInitializeEnvelopeSchema = createPaystackEnvelopeSchema(PaystackInitializeResponseBodySchema)

export const PaystackConfirmEnvelopeSchema = createPaystackEnvelopeSchema(PaystackConfirmPaymentResponseBodySchema)

export type PaystackInitializeEnvelope = z.infer<typeof PaystackInitializeEnvelopeSchema>

export type PaystackConfirmEnvelope = z.infer<typeof PaystackConfirmEnvelopeSchema>

type PaystackErrorCode = 'ABORTED' | 'HTTP_ERROR' | 'INVALID_RESPONSE' | 'NETWORK_ERROR'

type PaystackError = {
  code: PaystackErrorCode
  message: string
  status?: number
  issues?: z.core.$ZodIssue[]
}

export type PaystackResult<T> =
  | {
      ok: true
      value: T
    }
  | {
      ok: false
      error: PaystackError
    }

async function requestPaystack<TSchema extends z.ZodType>({
  args,
  init,
  path,
  schema,
}: {
  args: PaystackClientArgs
  init?: RequestInit
  path: string
  schema: TSchema
}): Promise<PaystackResult<z.output<TSchema>>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), args.requestTimeoutMs ?? 10_000)

  try {
    const headers = new Headers(init?.headers)

    headers.set('Accept', 'application/json')
    headers.set('Authorization', `Bearer ${args.secretKey}`)

    const response = await fetch(`${args.apiBase.replace(/\/$/, '')}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    })

    const responseBody: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        ok: false,
        error: {
          code: 'HTTP_ERROR',
          message: response.statusText || `Paystack request failed with status ${response.status}.`,
          status: response.status,
        },
      }
    }

    const result = schema.safeParse({
      status: response.status,
      data: responseBody,
      ...(response.statusText ? { message: response.statusText } : {}),
    })

    if (!result.success) {
      return {
        ok: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Paystack returned unexpected response data.',
          status: response.status,
          issues: result.error.issues,
        },
      }
    }

    return {
      ok: true,
      value: result.data,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        ok: false,
        error: {
          code: 'ABORTED',
          message: 'Paystack did not respond in time.',
        },
      }
    }

    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected Paystack request error occurred.',
      },
    }
  } finally {
    clearTimeout(timeout)
  }
}

export function createPaystackClient(args: PaystackClientArgs) {
  return {
    initializePaymentRequest(data: InitializeTransactionArgs) {
      return requestPaystack({
        args,
        init: {
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
        path: '/transaction/initialize',
        schema: PaystackInitializeEnvelopeSchema,
      })
    },

    confirmPaymentRequest(reference: string) {
      return requestPaystack({
        args,
        path: `/transaction/verify/${encodeURIComponent(reference)}`,
        schema: PaystackConfirmEnvelopeSchema,
      })
    },
  }
}
