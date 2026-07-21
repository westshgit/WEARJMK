import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/forms/LoginForm'
import { getUserServer } from '@/lib/api/user.api'

export default async function Login() {
  const { user } = await getUserServer()
  if (user) {
    redirect(`/account?warning=${encodeURIComponent('You are already logged in.')}`)
  }

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

export const metadata: Metadata = {
  description: 'Login or create an account to get started.',
  openGraph: {
    title: 'Login',
    url: '/login',
  },
  title: 'Login',
}
