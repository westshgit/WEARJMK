import type { ReactNode } from 'react'

import { AccountNav } from '@/components/AccountNav'
import { getUserServer } from '@/lib/api'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { user } = await getUserServer()

  return (
    <div>
      <div className="container my-16 flex gap-8">
        {user && <AccountNav className="max-w-62 grow flex-col items-start gap-4 hidden md:flex" />}
        <div className="flex flex-col gap-12 grow min-h-[50vh]">{children}</div>
      </div>
    </div>
  )
}
