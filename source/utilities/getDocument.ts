import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cacheLife, cacheTag } from 'next/cache'

type Collection = keyof Config['collections']

async function getDocument(collection: Collection, slug: string, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const page = await payload.find({
    collection,
    depth,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return page.docs[0]
}

async function cachedDocument(collection: Collection, slug: string) {
  'use cache'

  cacheTag(`${collection}_${slug}`)
  cacheLife('max')

  return getDocument(collection, slug)
}

export const getCachedDocument = (collection: Collection, slug: string) =>
  async () =>
    cachedDocument(collection, slug)
