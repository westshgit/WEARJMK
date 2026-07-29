import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { CheckoutPage } from '@/components/checkout/CheckoutPage'
import { getUserServer } from '@/lib/api/user.api'
import { getPagesAPIWithSlugAndCacheAPI } from '@/lib/api/page.api.cache'

export default async function Checkout() {
  const { user } = await getUserServer()
  const page = await getPagesAPIWithSlugAndCacheAPI({
    slug: 'home',
  })
  const policyBlock = page?.layout?.find((block) => block.blockType === 'policy')

  return (
    <div className="container">
      <h1 className="sr-only">Checkout</h1>
      <CheckoutPage user={user ?? undefined} policyBlock={policyBlock} />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Checkout.',
  openGraph: mergeOpenGraph({
    title: 'Checkout',
    url: '/checkout',
  }),
  title: 'Checkout',
}
