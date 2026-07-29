import type { Config } from '@/payload-types'

import { revalidateTag } from 'next/cache'

type Global = keyof Config['globals']

export function getGlobalCacheTag(slug: Global) {
  return `global_${slug}`
}

export function revalidateGlobal(slug: Global) {
  revalidateTag(getGlobalCacheTag(slug), 'max')
}
