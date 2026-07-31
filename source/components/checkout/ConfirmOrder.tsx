'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { confirmPaystackPayment } from '@/lib/api/payment/api'
import { useServerActionWithState } from '@/utilities'
import { useEcommerce } from '@payloadcms/plugin-ecommerce/client/react'
import { toast } from '@payloadcms/ui'
import { RiRefreshLine } from '@remixicon/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const ConfirmOrder: React.FC<{ reference: string | undefined }> = ({ reference }) => {
  const router = useRouter()
  const { clearSession } = useEcommerce()

  const {
    runAction,
    isPending,
    state: data,
  } = useServerActionWithState({
    action: (args) => confirmPaystackPayment(args as { reference: string }),
    onSuccess: ({ data: { orderID, accessToken, email } }) => {
      // data would be accessToken for non user then email for users and also order-id and transaction-id
      const queryParams = new URLSearchParams()
      if (email) {
        queryParams.set('email', email)
      }
      if (accessToken) {
        queryParams.set('accessToken', accessToken)
      }
      const queryString = queryParams.toString()
      const orderURL = `/orders/${orderID}${queryString ? `?${queryString}` : ''}`

      // Retire the purchased cart from the client session. Payload will create a
      // new cart (and a new secret for guests) the next time an item is added.
      clearSession()
      window.location.assign(orderURL)
    },
    onError: (result) => {
      if (result.formError) {
        toast.error(result.formError)
      }
    },
  })

  function handleConfirmOrder() {
    if (reference) {
      runAction({ reference })
    } else {
      router.push('/')
    }
  }

  // This run on mount alone
  useEffect(() => {
    handleConfirmOrder()
  }, [])

  return (
    <div className="text-center w-full flex flex-col items-center justify-start gap-4">
      <h1 className="text-2xl uppercase">Confirming Order</h1>

      {!isPending && data && 'formError' in data && data.formError ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-destructive">{data.formError}</p>
          <Button type="button" onClick={handleConfirmOrder} className="uppercase font-mono px-2 space-x-0.5">
            <RiRefreshLine />
            <span>Try again</span>
          </Button>
        </div>
      ) : (
        <LoadingSpinner className="w-12 h-6" />
      )}
    </div>
  )
}
