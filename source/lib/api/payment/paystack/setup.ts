// @ts-expect-error "@paystack/paystack-sdk" does not have a default export, but the module is being imported as if it does. Consider using a named import instead.
import { Paystack } from '@paystack/paystack-sdk'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('PAYSTACK_SECRET_KEY is not defined in environment variables')
}

export const paystackSetup = new Paystack(PAYSTACK_SECRET_KEY)
