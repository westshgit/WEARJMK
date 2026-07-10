'use server'

import { BasePayload } from 'payload'
import configPromise from '@payload-config'
import { getPayload as getPayloadOriginal } from 'payload'

export async function getPayloadAPI(): Promise<BasePayload> {
  const payload = await getPayloadOriginal({ config: configPromise })
  return payload
}
