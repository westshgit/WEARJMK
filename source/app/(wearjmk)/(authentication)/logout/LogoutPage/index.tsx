'use client'

import { logout } from '@/lib/api'
import { useServerActionWithState } from '@/utilities'
import Link from 'next/link'
import React, { useEffect, useRef } from 'react'

export const LogoutPage: React.FC = () => {
  const { runAction, state: result } = useServerActionWithState({
    action: logout,
  })
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    runAction({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="size-full bg-background md:bg-transparent">
      <div className="prose px-8 pt-30 md:pt-8 md:mt-16 md:rounded-2xl pb-8 dark:prose-invert md:bg-background md:shadow md:mx-auto">
        <h1>{!result ? 'Logging out…' : result.success ? 'Logged out successfully' : result.formError}</h1>
        {result && (
          <p>
            What would you like to do next? <Link href="/shop">Click here</Link> to shop. To log back in, <Link href="/login">click here</Link>.
          </p>
        )}
      </div>
    </div>
  )
}
