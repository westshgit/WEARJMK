import { BasePayload } from 'payload'
import configPromise from '@payload-config'
import { getPayload as getPayloadOriginal } from 'payload'
import { headers as nextHeaders } from 'next/headers'
import { createPayloadRequest } from 'payload'
import config from '@payload-config'
import { Env } from '../env'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function getPayloadAPI(): Promise<BasePayload> {
  const payload = await getPayloadOriginal({ config: configPromise })
  return payload
}

export async function syntheticServerRequest() {
  const headersList = await nextHeaders()
  // synthetic Request — createPayloadRequest only reads headers/URL off it,
  // there's no real network request happening in a server action
  const request = new Request(Env.PAYLOAD_PUBLIC_SERVER_URL, {
    headers: headersList,
  })
  return await createPayloadRequest({ config, request })
}

export type CacheKey<T> = (args: T) => string
type RevalidateTagProfile = string | { expire?: number }

type HookArgs<CollectionHook extends (...args: never[]) => unknown> = Parameters<CollectionHook>[0]

export type GenericCollectionChangeHook<CollectionHook extends (...args: never[]) => unknown> = {
  getCacheKey: CacheKey<HookArgs<CollectionHook>>
  shouldRevalidateHook?: (args: HookArgs<CollectionHook>) => boolean
  tagOrPath:
    | {
        tag: 'tag'
        profile?: RevalidateTagProfile
      }
    | 'path'
    | 'both'
}

export function genericCollectionChangeHook<CollectionHook extends (...args: never[]) => unknown>(
  genericCollectionChangeHooks: GenericCollectionChangeHook<CollectionHook>[],
) {
  return function (
    collectionHookParameter: HookArgs<CollectionHook> & {
      doc: unknown
      req: {
        context: {
          disableRevalidate?: boolean
        }
      }
    },
  ) {
    const {
      doc,
      req: {
        context: { disableRevalidate },
      },
    } = collectionHookParameter

    if (Boolean(disableRevalidate)) return doc

    for (const gch of genericCollectionChangeHooks) {
      const { tagOrPath, getCacheKey, shouldRevalidateHook } = gch
      if (shouldRevalidateHook && !shouldRevalidateHook(collectionHookParameter)) continue

      const cacheKey = getCacheKey(collectionHookParameter)

      if (tagOrPath === 'path' || tagOrPath === 'both') revalidatePath(cacheKey)
      if (typeof tagOrPath === 'object' && 'tag' in tagOrPath && tagOrPath.tag === 'tag') {
        revalidateTag(cacheKey, tagOrPath.profile ?? 'max')
      }
      if (tagOrPath === 'both') {
        revalidateTag(cacheKey, 'max')
      }
    }

    return doc
  }
}
