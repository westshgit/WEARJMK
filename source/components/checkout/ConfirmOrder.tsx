'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { confirmPaystackPayment } from '@/lib/api/payment.api'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { toast } from '@payloadcms/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export const ConfirmOrder: React.FC = () => {
  const { clearCart } = useCart()

  const searchParams = useSearchParams()
  const router = useRouter()
  // Ensure we only confirm the order once, even if the component re-renders
  const isConfirming = useRef(false)
  const [attempt, setAttempt] = useState(0)
  const [confirmationError, setConfirmationError] = useState<string | null>(null)

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')

    if (reference) {
      if (!isConfirming.current) {
        isConfirming.current = true

        void confirmPaystackPayment(reference)
          .then((result) => {
            if (result.success) {
              const { accessToken = '', orderID } = result.data
              const queryParams = new URLSearchParams()

              if (accessToken) {
                queryParams.set('accessToken', accessToken)
              }

              const queryString = queryParams.toString()
              void clearCart()
              router.push(`/orders/${orderID}${queryString ? `?${queryString}` : ''}`)
              return
            }

            throw new Error(result.formError || 'Payment confirmation did not return an order.')
          })
          .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : 'Unable to confirm this payment.'
            isConfirming.current = false
            setConfirmationError(message)
            toast.error(message)
          })
      }
    } else {
      router.push('/')
    }
  }, [attempt, clearCart, router, searchParams])

  return (
    <div className="text-center w-full flex flex-col items-center justify-start gap-4">
      <h1 className="text-2xl uppercase">Confirming Order</h1>

      {confirmationError ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-destructive">{confirmationError}</p>
          <Button
            type="button"
            onClick={() => {
              setConfirmationError(null)
              setAttempt((currentAttempt) => currentAttempt + 1)
            }}
          >
            Try again
          </Button>
        </div>
      ) : (
        <LoadingSpinner className="w-12 h-6" />
      )}
    </div>
  )
}
