'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

const PARAMS = ['error', 'warning', 'success', 'message'] as const
const STATIC_DURARION = parseInt(process.env.MESSAGE_DURATION) ?? 20000

const defaultToastOptions = {
  duration: STATIC_DURARION,
  richColors: true,
  dismissible: true,
  closeButton: true,
}

export default function ParamsRenderer() {
  const searchParams = useSearchParams()

  useEffect(() => {
    PARAMS.forEach((param) => {
      const value = searchParams?.get(param)
      if (value && value !== null) {
        switch (param) {
          case 'error':
            toast.error(value, { ...defaultToastOptions })
            break
          case 'warning':
            toast.warning(value, { ...defaultToastOptions })
            break
          case 'success':
            toast.success(value, { ...defaultToastOptions })
            break
          case 'message':
            toast.message(value, { ...defaultToastOptions })
            break
        }
      }
    })
  }, [searchParams])

  return null
}

function parseInt(value: string | undefined): number | null {
  if (value === undefined) return null
  const parsed = Number(value)
  return isNaN(parsed) ? null : parsed
}
