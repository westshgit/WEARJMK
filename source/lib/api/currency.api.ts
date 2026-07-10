import { Currency } from '@payloadcms/plugin-ecommerce/types'
import { getPayloadAPI } from './shared'
import { unstable_cache } from 'next/cache'
import { Currency as SyncCurrency } from '@/payload-types'

async function __fetchCurrencies(): Promise<[Currency[], SyncCurrency[]] | null> {
  const payload = await getPayloadAPI()

  try {
    const currencies = await payload.find({
      collection: 'currency',
      limit: 10,
      select: {
        code: true,
        label: true,
        symbol: true,
        decimalPlaces: true,
        exchangeRateToNGN: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        isActive: {
          equals: true,
        },
      },
    })

    return [currencies.docs.map((currency) => fromSyncCurrencyToCurrency(currency as SyncCurrency)), currencies.docs as SyncCurrency[]]
  } catch (error) {
    payload.logger.error('Error fetching currencies:')
    payload.logger.error(error)
    return null
  }
}

export async function fetchCurrencies(): Promise<[Currency[], SyncCurrency[]] | null> {
  return unstable_cache(() => __fetchCurrencies(), ['currencies'], {
    tags: ['currencies'],
    revalidate: 18000,
  })()
}

function fromSyncCurrencyToCurrency(currency: SyncCurrency): Currency {
  return {
    code: currency.code,
    label: currency.label,
    symbol: currency.symbol,
    decimals: currency.decimalPlaces,
    symbolDisplay: 'symbol',
  }
}
