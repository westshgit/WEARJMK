import { z } from 'zod'
import path from 'node:path'
import { existsSync } from 'node:fs'
import dotenv from 'dotenv'

// Next.js loads .env files automatically during dev/build/start.
// This module is also used by standalone scripts run outside Next (tsx/node),
// so we load .env manually as a fallback here. dotenv does NOT override
// variables that are already set, so this is a no-op inside Next.js.
let envPath = path.resolve(process.cwd(), '.env')

// This is a fallback for scripts that are run from a subdirectory (e.g. scripts/).
// we must be careful while using this workaround
if (!existsSync(envPath)) {
  // Script may be run from a subdirectory (e.g. scripts/), so go up one level
  envPath = path.resolve(process.cwd(), '..', '.env')
}

if (existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  console.warn(`[env] No .env file found at ${envPath} — relying on process.env from the environment`)
}

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
