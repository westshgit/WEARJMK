import type { BasePayload } from 'payload'

import { getPayloadAPI } from '@/lib/api/shared'
import type { Page, PagesSelect } from '@/payload-types'
import { notDraftWhereFilter } from '@/utilities/notDraftWhereFilter'

type FindPagesOptions = Parameters<BasePayload['find']>[0]

type _GetPagesArgs = Omit<FindPagesOptions, 'select'> & {
  select?: PagesSelect<false> | PagesSelect<true>
}

export type GetPagesArgs = Partial<Omit<_GetPagesArgs, 'collection' | 'draft' | 'overrideAccess' | 'req' | 'user'>>

export async function getPagesAPI({
  where,
  draft = false,
  ...rest
}: GetPagesArgs & {
  draft?: boolean
}): Promise<Page[] | null> {
  const payload = await getPayloadAPI()

  try {
    const { docs } = await payload.find({
      collection: 'pages',
      draft,
      overrideAccess: draft,
      ...rest,
      where: draft ? where : notDraftWhereFilter(where ?? {}),
    })

    return docs as Page[]
  } catch (error) {
    console.error('Error fetching pages:', error)
    return null
  }
}

export async function getPagesAPIWithSlug({
  slug,
  draft = true,
  ...rest
}: GetPagesArgs & {
  slug: string
  draft?: boolean
}) {
  const docs = await getPagesAPI({
    limit: 1,
    pagination: false,
    where: {
      and: [{ slug: { equals: slug } }, ...(rest.where ? [rest.where] : [])],
    },
    draft,
  })
  return docs && docs.length > 0 ? docs[0] : null
}
