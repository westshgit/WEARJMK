'use client'

function normalizePublicEnv(envVar: string | undefined): string {
  return envVar?.trim() ?? ''
}

export const SUPPORT_EMAIL = normalizePublicEnv(process.env.NEXT_PUBLIC_SUPPORT_EMAIL)
export const SITE_NAME = normalizePublicEnv(process.env.NEXT_PUBLIC_SITE_NAME)
export const SUPPORT_WHATSAPP = normalizePublicEnv(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP)
