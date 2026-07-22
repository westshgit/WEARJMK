import clsx from 'clsx'
import React from 'react'

import { Price } from '@/components/Price'
import { Button } from '../ui/button'

type Props = {
  amount: number
  position?: 'bottom' | 'center'
  title: string
  className?: string
}

export const Label: React.FC<Props> = ({ amount, position = 'bottom', title, className }) => {
  return (
    <div
      className={clsx('absolute bottom-0 left-0 flex w-full px-4 pb-4 @container/label', className, {
        '': position === 'center',
      })}
    >
      <div className="flex flex-col md:flex-row gap-1 items-end justify-between text-sm grow font-semibold ">
        <Button size={'xs'} variant={'outline'} className="w-fit">
          <h3 className="uppercase">{title}</h3>
        </Button>

        <Button size={'xs'} variant={'outline'}>
          <Price amount={amount} currencyCodeClassName="hidden @[275px]/label:inline" />
        </Button>
      </div>
    </div>
  )
}
