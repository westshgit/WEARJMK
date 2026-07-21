import type { Metadata } from 'next'
import { Suspense } from 'react'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { CreateAccountForm } from '@/components/forms/CreateAccountForm'
import { redirect } from 'next/navigation'
import { getUserServer } from '@/lib/api'

export default async function CreateAccount() {
  const { user } = await getUserServer()
  if (user) {
    redirect(`/account?warning=${encodeURIComponent('You are already logged in.')}`)
  }

  return (
    <Suspense fallback={null}>
      <CreateAccountForm />
    </Suspense>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Account',
    url: '/account',
  }),
  title: 'Account',
}
