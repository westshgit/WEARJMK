'use client'
import clsx from 'clsx'
import { getErrorMessage } from '@/lib/constants.client'
import { FieldMetaLike, fieldIsErrorAfterTouched } from './shared.api'

type Props = {
  message?: string
  as?: 'p' | 'span'
  className?: string
}

export const FormError: React.FC<Props> = ({ message, as, className }) => {
  const Element = as || 'p'

  if (!message) {
    return null
  }

  return <Element className={clsx('text-error text-sm', className)}>{message}</Element>
}

export function FormFieldError({ meta, as, className }: { meta: FieldMetaLike } & Props) {
  if (!fieldIsErrorAfterTouched(meta)) return null
  return <FormError message={getErrorMessage(meta.errors[0])} as={as} className={className} />
}
