import { Env } from '@/lib/env'
import { stripeAdapter as createStripeAdapter } from '@/patches/dist/payments/adapters/stripe'

export const stripeAdapter = createStripeAdapter({
  secretKey: Env.STRIPE_SECRET_KEY,
  publishableKey: Env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  webhookSecret: Env.STRIPE_WEBHOOKS_SIGNING_SECRET,
})

export type StripeAdapter = typeof stripeAdapter
