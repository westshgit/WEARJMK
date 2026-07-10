'use server'

import { SanitizedPermissions } from 'payload'
import { headers } from 'next/headers'
import { User } from '@/payload-types'
import { getPayloadAPI } from './shared'

export async function getUserServer(): Promise<{ user: User | null; permissions: SanitizedPermissions | null }> {
  try {
    const payload = await getPayloadAPI()
    const reqHeaders = await headers()
    const { user, permissions } = await payload.auth({
      headers: reqHeaders,
    })
    return {
      user,
      permissions,
    }
  } catch (_) {
    return {
      user: null,
      permissions: null,
    }
  }
}
