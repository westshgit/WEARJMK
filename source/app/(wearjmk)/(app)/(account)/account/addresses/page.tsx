import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { redirect } from 'next/navigation'
import { AddressListing } from '@/components/addresses/AddressListing'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { getUserServer } from '@/lib/api'

export default async function AddressesPage() {
  const user = await getUserServer()
  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your account settings.')}`)
  }

  return (
    <div className="border p-8 rounded-lg bg-primary-foreground">
      <h1 className="text-3xl font-medium mb-8">Addresses</h1>
      <div className="mb-8">
        <AddressListing />
      </div>
      <CreateAddressModal />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Manage your addresses.',
  openGraph: mergeOpenGraph({
    title: 'Addresses',
    url: '/account/addresses',
  }),
  title: 'Addresses',
}
