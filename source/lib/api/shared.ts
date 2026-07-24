'use server'

import { BasePayload } from 'payload'
import configPromise from '@payload-config'
import { getPayload as getPayloadOriginal } from 'payload'
import { headers as nextHeaders } from 'next/headers'
import { createPayloadRequest } from 'payload'
import config from '@payload-config'
import { Env } from '../env'

export async function getPayloadAPI(): Promise<BasePayload> {
  const payload = await getPayloadOriginal({ config: configPromise })
  return payload
}

export async function syntheticServerRequest() {
  const headersList = await nextHeaders()
  // synthetic Request — createPayloadRequest only reads headers/URL off it,
  // there's no real network request happening in a server action
  const request = new Request(Env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000', {
    headers: headersList,
  })
  return await createPayloadRequest({ config, request })
}
