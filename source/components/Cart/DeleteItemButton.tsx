'use client'

import type { CartItem } from '@/components/Cart'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { Trash } from 'lucide-react'
import { Button } from '../ui/button'

export function DeleteItemButton({ item }: { item: CartItem }) {
  const { isLoading, removeItem } = useCart()
  const itemId = item.id

  return (
    <form>
      <Button
        aria-label="Remove cart item"
        className={clsx('', {
          'cursor-not-allowed px-0': !itemId || isLoading,
        })}
        disabled={!itemId || isLoading}
        onClick={(e) => {
          e.preventDefault()
          if (itemId) removeItem(itemId)
        }}
        type="button"
        variant={'destructive'}
      >
        <Trash />
      </Button>
    </form>
  )
}
