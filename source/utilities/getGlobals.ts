import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { getGlobalCacheTag } from './globalCache'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(slug: T, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  return global
}

function cachedGlobal<T extends Global>(slug: T, depth = 0) {
  return unstable_cache(() => getGlobal<T>(slug, depth), ['global', String(slug), String(depth)], {
    tags: [getGlobalCacheTag(slug)],
    revalidate: false,
  })()
}

export const getCachedGlobal =
  <T extends Global>(slug: T, depth = 0) =>
  async () =>
    cachedGlobal<T>(slug, depth)
