import { Suspense } from 'react'
import { HeaderClient } from './index.client'
import { getUserServer } from '@/lib/api/user.api'

export async function Header() {
  const { user } = await getUserServer()

  return (
    <Suspense fallback={null}>
      <HeaderClient user={user ?? undefined} />
    </Suspense>
  )
}
