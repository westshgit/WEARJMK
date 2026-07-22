import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import configPromise from '@payload-config'

async function getPublishedPageBySlug(slug: string) {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })

  return result.docs?.[0] || null
}

export async function queryPageBySlug({ slug }: { slug: string }) {
  const { isEnabled: draft } = await draftMode()

  // Draft/preview mode: always hit the DB directly, never cache.
  // Editors need to see unpublished changes immediately.
  if (draft) {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'pages',
      draft: true,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { and: [{ slug: { equals: slug } }] },
    })

    return result.docs?.[0] || null
  }

  // Published path: cacheable, keyed by slug.
  const cachedQuery = unstable_cache(() => getPublishedPageBySlug(slug), ['pages-by-slug', slug], {
    tags: [`pages_${slug}`, 'pages'],
    revalidate: false, // rely on tag-based revalidation, not time
  })

  return cachedQuery()
}
