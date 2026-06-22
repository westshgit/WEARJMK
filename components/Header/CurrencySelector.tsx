'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'

const headerCurrencies = ['NGN', 'USD', 'GBP']

export function CurrencySelector() {
  const { currency, setCurrency, supportedCurrencies } = useCurrency()

  const availableCurrencies = supportedCurrencies.filter((item) =>
    headerCurrencies.includes(item.code),
  )

  if (!availableCurrencies.length) {
    return null
  }

  const selectedCurrencyCode = availableCurrencies.some((item) => item.code === currency.code)
    ? currency.code
    : availableCurrencies[0].code

  return (
    <Select onValueChange={setCurrency} value={selectedCurrencyCode}>
      <SelectTrigger className="w-auto border-none bg-transparent px-2 uppercase md:pl-3">
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        {availableCurrencies.map((item) => (
          <SelectItem key={item.code} value={item.code}>
            {item.symbol} {item.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
