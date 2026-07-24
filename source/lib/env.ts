import 'server-only'
import path from 'node:path'
import dotenv from 'dotenv'
import { z } from 'zod'

// Next.js loads .env files automatically during dev/build/start.
// This module is also used by standalone scripts run outside Next (tsx/node),
// so we load .env manually as a fallback here. dotenv does NOT override
// variables that are already set, so this is a no-op inside Next.js.
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // --- server-only ---
  PAYLOAD_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  COMPANY_NAME: z.string().min(1),
  TWITTER_CREATOR: z.string().min(1).optional(),
  TWITTER_SITE: z.url().optional(),
  PAYLOAD_PUBLIC_SERVER_URL: z.url(),
  PREVIEW_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOKS_SIGNING_SECRET: z.string().startsWith('whsec_'),
  PAYSTACK_SECRET_KEY: z.string().startsWith('sk_'),

  // --- public (kept here too for server-side convenience/consistency;
  // client components must still reference process.env.NEXT_PUBLIC_X
  // directly — see note below) ---
  NEXT_PUBLIC_SITE_NAME: z.string().min(1),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.email(),
  NEXT_PUBLIC_SUPPORT_WHATSAPP: z.string().min(1),
  NEXT_PUBLIC_SERVER_URL: z.url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_SHOWCASE_PRODUCTS_LIMITS: z.coerce.number().int().positive(),
})

const _Env = schema.safeParse(process.env)

if (!_Env.success) {
  throw new Error(`Invalid environment variables: ${JSON.stringify(_Env.error.format(), null, 2)}`)
}

export const Env = _Env.data
