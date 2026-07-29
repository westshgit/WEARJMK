import { Env } from '@/lib/env'
import { stripeAdapter as createStripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'

if (!Env.STRIPE_SECRET_KEY || !Env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || !Env.STRIPE_WEBHOOKS_SIGNING_SECRET) {
  throw new Error('Stripe environment variables are required when the Stripe adapter is enabled.')
}

export const stripeAdapter = createStripeAdapter({
  secretKey: Env.STRIPE_SECRET_KEY,
  publishableKey: Env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  webhookSecret: Env.STRIPE_WEBHOOKS_SIGNING_SECRET,
})

export type StripeAdapter = typeof stripeAdapter
