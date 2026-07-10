'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'

const headerCurrencies = ['NGN', 'USD', 'GBP', 'EUR']

export default function CurrencySelector() {
  const { currency, setCurrency, supportedCurrencies } = useCurrency()
  const availableCurrencies = supportedCurrencies.filter((item) => headerCurrencies.includes(item.code))

  if (!availableCurrencies.length) {
    return null
  }

  const selectedCurrency = availableCurrencies.some((item) => item.code === currency.code) ? currency : availableCurrencies[0]

  return (
    <Select onValueChange={setCurrency} value={selectedCurrency.code}>
      <SelectTrigger className="w-full uppercase md:pl-3">
        <SelectValue placeholder="Currency">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={selectedCurrency.code}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="inline-block"
            >
              {selectedCurrency.symbol} {selectedCurrency.code}
            </motion.span>
          </AnimatePresence>
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper">
        {availableCurrencies.map((item) => (
          <SelectItem key={item.code} value={item.code}>
            {item.symbol} {item.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
