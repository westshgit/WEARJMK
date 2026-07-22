import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { Fragment } from 'react'

import { CheckoutPage } from '@/components/checkout/CheckoutPage'
import { getUserServer } from '@/lib/api/user.api'
import { queryPageBySlug } from '@/lib/api/page.api'

export default async function Checkout() {
  const { user } = await getUserServer()
  const page = await queryPageBySlug({
    slug: 'home',
  })
  const policyBlock = page?.layout?.find((block) => block.blockType === 'policy')

  return (
    <div className="container">
      {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
        <div>
          <Fragment>
            {'To enable checkout, you must '}
            <a href="https://dashboard.stripe.com/test/apikeys" rel="noopener noreferrer" target="_blank">
              obtain your Stripe API Keys
            </a>
            {' then set them as environment variables. See the '}
            <a href="https://github.com/payloadcms/payload/blob/3.x/templates/ecommerce/README.md#stripe" rel="noopener noreferrer" target="_blank">
              README
            </a>
            {' for more details.'}
          </Fragment>
        </div>
      )}

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
