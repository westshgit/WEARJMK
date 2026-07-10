import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { HeaderClient } from './index.client'

export async function Header() {
  // const header = await getCachedGlobal('header', 1)()
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 100,
    disableErrors: true,
    select: {
      slug: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      generatedSlug: true,
    },
  })

  return <HeaderClient categories={docs} />
}
