import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { FindOrderForm } from '@/components/forms/FindOrderForm'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getUserServer } from '@/lib/api'

export default async function FindOrderPage() {
  const { user } = await getUserServer()

  return (
    <div className="container py-16">
      <FindOrderForm user={user} />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Find your order using your email and order ID.',
  openGraph: mergeOpenGraph({
    title: 'Find order',
    url: '/find-order',
  }),
  title: 'Find order',
}
