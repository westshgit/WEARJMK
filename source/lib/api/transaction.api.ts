import type { BasePayload } from 'payload'

import type { Transaction, TransactionsSelect } from '@/payload-types'
import { getPayloadAPI } from './shared'
import type { CreateError } from '@/utilities/createError'

type FindTransactionsOptions = Parameters<BasePayload['find']>[0]
type CreateTransactionOptions = Parameters<BasePayload['create']>[0]

type _GetTransactionsArgs = Omit<FindTransactionsOptions, 'select'> & {
  select?: TransactionsSelect<false> | TransactionsSelect<true>
}

type _CreateTransactionArgs = Omit<CreateTransactionOptions, 'collection' | 'data' | 'select'> & {
  collection: 'transactions'
  data: Omit<Transaction, 'createdAt' | 'id' | 'updatedAt'>
  select?: TransactionsSelect<false> | TransactionsSelect<true>
}

export type GetTransactionsArgs = Partial<Omit<_GetTransactionsArgs, 'collection' | 'overrideAccess' | 'user'>>

export type CreateTransactionArgs = Omit<_CreateTransactionArgs, 'collection' | 'overrideAccess' | 'user'>

export async function findTransactionsAPI({ select, ...rest }: GetTransactionsArgs): Promise<Transaction[] | null> {
  const payload = await getPayloadAPI()

  const findArgs = {
    collection: 'transactions',
    overrideAccess: true,
    ...(select ? { select } : {}),
    ...rest,
  } as _GetTransactionsArgs

  try {
    const { docs } = await payload.find(findArgs)

    if (!docs) {
      return null
    }

    return docs as Transaction[]
  } catch (error) {
    return null
  }
}

export const getTransactionAPI = findTransactionsAPI

export async function createTransaction({ select, ...rest }: CreateTransactionArgs): Promise<Transaction | CreateError> {
  const payload = await getPayloadAPI()

  const createArgs = {
    collection: 'transactions',
    overrideAccess: true,
    ...(select ? { select } : {}),
    ...rest,
  } as _CreateTransactionArgs

  try {
    const transaction = await payload.create(createArgs)
    return transaction as Transaction
  } catch (error) {
    console.error('Error creating transaction:', error)
    const errorText = getErrorText(error).toLowerCase()

    return errorText.includes('duplicate') ||
      errorText.includes('already exists') ||
      errorText.includes('unique constraint') ||
      errorText.includes('unique violation') ||
      errorText.includes('e11000') ||
      errorText.includes('23505') ||
      errorText.includes('sqlite_constraint_unique')
      ? {
          message: 'We could not create the transaction because a record with the same unique field already exists.',
          reason: 'RecordExist',
        }
      : {
          message: 'We could not create the transaction. Please check the transaction details and try again.',
          reason: 'ConstraintError',
        }
  }
}

function getErrorText(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name} ${error.message}`
  }

  if (!(typeof error === 'object' && error !== null)) {
    return ''
  }
  const _error = error as Record<string, unknown>
  const name = typeof _error.name === 'string' ? _error.name : ''
  const message = typeof _error.message === 'string' ? _error.message : ''
  const code = typeof _error.code === 'string' || typeof _error.code === 'number' ? String(_error.code) : ''
  return `${name} ${message} ${code}`
}
