import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { Suspense } from 'react'
import { ConfirmOrder } from '@/components/checkout/ConfirmOrder'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ConfirmOrderPage({ searchParams: searchParamsPromise }: { searchParams: SearchParams }) {
  const searchParams = await searchParamsPromise
  const reference = searchParams.reference || searchParams.trxref
  let referenceValue: string | undefined
  if (Array.isArray(reference)) {
    referenceValue = reference[0]
  } else {
    referenceValue = reference
  }

  return (
    <div className="container min-h-[90vh] flex py-12">
      <Suspense fallback={null}>
        <ConfirmOrder reference={referenceValue} />
      </Suspense>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Confirm order.',
  openGraph: mergeOpenGraph({
    title: 'Confirming order',
    url: '/checkout/confirm-order',
  }),
  title: 'Confirming order',
}
