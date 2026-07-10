import { Button } from '@/components/ui/button'
import { RiShoppingCart2Line } from '@remixicon/react'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  return (
    <Button variant="ghost" size="sm" className="hover:cursor-pointer" {...rest}>
      <RiShoppingCart2Line />
      <span>Cart</span>

      {quantity ? (
        <>
          <span>•</span>
          <span>{quantity}</span>
        </>
      ) : null}
    </Button>
  )
}
