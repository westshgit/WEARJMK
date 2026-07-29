import type { PaystackInitializeData, PaystackTransactionData } from './types'

type PaystackClientArgs = {
  apiBase: string
  requestTimeoutMs: number
  secretKey: string
}

type InitializeTransactionArgs = {
  amount: number
  callback_url: string
  currency: 'NGN'
  email: string
  metadata: string
  reference: string
}

type PaystackEnvelope = {
  data?: unknown
  message?: unknown
  status?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getMessage(body: PaystackEnvelope | null, fallback: string): string {
  return typeof body?.message === 'string' && body.message ? body.message : fallback
}

function isInitializeData(value: unknown): value is PaystackInitializeData {
  return isRecord(value) && typeof value.access_code === 'string' && typeof value.authorization_url === 'string' && typeof value.reference === 'string'
}

function isTransactionData(value: unknown): value is PaystackTransactionData {
  return (
    isRecord(value) &&
    typeof value.amount === 'number' &&
    typeof value.currency === 'string' &&
    typeof value.reference === 'string' &&
    typeof value.status === 'string'
  )
}

async function requestPaystack<T>({
  args,
  init,
  path,
  validate,
}: {
  args: PaystackClientArgs
  init?: RequestInit
  path: string
  validate: (value: unknown) => value is T
}): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), args.requestTimeoutMs)

  try {
    const headers = new Headers(init?.headers)
    headers.set('Accept', 'application/json')
    headers.set('Authorization', `Bearer ${args.secretKey}`)

    const response = await fetch(`${args.apiBase.replace(/\/$/, '')}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    })

    const rawBody: unknown = await response.json().catch(() => null)
    const body: PaystackEnvelope | null = isRecord(rawBody) ? rawBody : null

    if (!response.ok || body?.status !== true) {
      throw new Error(getMessage(body, `Paystack request failed with status ${response.status}.`))
    }

    if (!validate(body.data)) {
      throw new Error('Paystack returned an invalid response.')
    }

    return body.data
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Paystack did not respond in time.')
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export function createPaystackClient(args: PaystackClientArgs) {
  if (!args.secretKey) {
    throw new Error('Paystack secret key is required.')
  }

  return {
    initialize(data: InitializeTransactionArgs) {
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
        validate: isInitializeData,
      })
    },
    verify(reference: string) {
      return requestPaystack({
        args,
        path: `/transaction/verify/${encodeURIComponent(reference)}`,
        validate: isTransactionData,
      })
    },
  }
}
