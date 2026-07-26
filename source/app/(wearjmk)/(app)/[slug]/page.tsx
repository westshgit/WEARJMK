import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { generateMeta } from '@/utilities/generateMeta'

import { notFound } from 'next/navigation'
import { getPageAPI, queryPageBySlug } from '@/lib/api/page.api'
import type { Page } from '@/payload-types'

export async function generateStaticParams() {
  const pages = await getPageAPI({
    limit: 1000,
    pagination: false,
    select: {
      slug: true,
    },
  })
  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params }: Args) {
  const { slug = 'home' } = await params

  const page = await queryPageBySlug({
    slug,
  })
  if (!page) {
    return notFound()
  }
  const { layout } = page

  return (
    <div className="space-y-32 mb-16 p-6 lg:p-2 xl:p-0 container">
      <RenderBlocks blocks={layout} />
    </div>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home' } = await params

  const page = await queryPageBySlug({
    slug,
  })

  return generateMeta({ doc: (page ?? {}) as Page })
}
