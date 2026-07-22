'use client'

import BrandImage from '@/components/BrandImage'

import { Button } from '@/components/ui/button'
import { logout } from '@/lib/api'
import { useServerActionWithState } from '@/utilities'
import { LogIn, Store } from 'lucide-react'
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
    <>
      <div className="p-4 pt-16!">
        <div className="m-2 bg-background max-w-7xl mx-auto p-4 space-y-36">
          <BrandImage />
          <div className="space-y-9">
            <h1 className="text-4xl md:text-7xl">{!result ? 'Logging out…' : result.success ? 'Logged out successfully' : result.formError}</h1>
            {result && (
              <div className="space-y-2">
                <p>What would you like to do next?</p>

                <div className="space-x-1">
                  <Link href="/shop">
                    <Button className="uppercase cursor-pointer" size={'lg'} variant={'outline'}>
                      <Store className="size-4" />
                      Go to Shop
                    </Button>
                  </Link>{' '}
                  <Link href="/login">
                    <Button className="uppercase cursor-pointer" size={'lg'}>
                      <LogIn className="size-4" />
                      Log Back In
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
