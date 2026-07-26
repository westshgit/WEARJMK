import type { PaystackInitializeData, PaystackResponse, PaystackTransactionData } from './types'

type PaystackClientArgs = {
  apiBase: string
  requestTimeoutMs: number
  secretKey: string
}

function getPaystackErrorMessage(value: unknown, fallback: string): string {
  if (typeof value !== 'object' || value === null || !('message' in value)) return fallback
  return typeof value.message === 'string' && value.message ? value.message : fallback
}

async function parsePaystackResponse<T>(response: Response, fallback: string): Promise<T> {
  const body: unknown = await response.json().catch(() => null)

  if (
    !response.ok ||
    typeof body !== 'object' ||
    body === null ||
    !('status' in body) ||
    body.status !== true ||
    !('data' in body)
  ) {
    throw new Error(getPaystackErrorMessage(body, fallback))
  }

  return (body as PaystackResponse<T>).data
}

export function createPaystackClient({ apiBase, requestTimeoutMs, secretKey }: PaystackClientArgs) {
  const normalizedAPIBase = apiBase.replace(/\/+$/, '')
  const authorizationHeader = { Authorization: `Bearer ${secretKey}` }

  return {
    initialize: async (body: Record<string, unknown>) => {
      const response = await fetch(`${normalizedAPIBase}/transaction/initialize`, {
        method: 'POST',
        headers: {
          ...authorizationHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(requestTimeoutMs),
      })

      return parsePaystackResponse<PaystackInitializeData>(response, 'Paystack failed to initialize the transaction')
    },

    verify: async (reference: string) => {
      const response = await fetch(`${normalizedAPIBase}/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: authorizationHeader,
        signal: AbortSignal.timeout(requestTimeoutMs),
      })

      return parsePaystackResponse<PaystackTransactionData>(response, 'Paystack failed to verify the transaction')
    },
  }
}
