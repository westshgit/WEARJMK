'use client'

import { useActionState, useCallback, useTransition } from 'react'
import { ActionResult, SuccessResult, FailureResult } from '@/lib/shared'
import type { AnyFormApi } from '@tanstack/react-form'

export type UseServerActionWithStateArgs<T, U> = {
  action: (args: U) => Promise<ActionResult<T> | null>
  onSuccess?: (result: SuccessResult<T>) => void
  onError?: (result: FailureResult) => void
}

export function useServerActionWithState<T, U>({ action, onSuccess, onError }: UseServerActionWithStateArgs<T, U>) {
  const wrappedAction = useCallback(
    async (_prevState: ActionResult<T> | null, args: U) => {
      const result = await action(args)

      if (result) {
        if (result.success) {
          onSuccess?.(result)
        } else {
          onError?.(result)
        }
      }

      return result
    },
    [action, onSuccess, onError],
  )

  const [state, dispatchAction, isActionPending] = useActionState(wrappedAction, null)
  const [isTransitionPending, startTransition] = useTransition()

  const runAction = useCallback(
    (args: U) => {
      startTransition(() => dispatchAction(args))
    },
    [dispatchAction],
  )

  return {
    state,
    dispatchAction,
    runAction,
    isPending: isActionPending || isTransitionPending,
  }
}

export function applyServerFieldErrors(form: AnyFormApi, fieldErrors: Record<string, string>) {
  const knownFields = Object.keys(form.state.values)

  for (const [field, message] of Object.entries(fieldErrors)) {
    if (!knownFields.includes(field)) continue // caller decides what to do with unmatched keys separately
    form.setFieldMeta(field, (prev) => ({
      ...prev,
      errorMap: { ...prev.errorMap, onServer: message },
    }))
  }

  return Object.entries(fieldErrors).filter(([field]) => !knownFields.includes(field))
}

export function clearServerErrorOnChange(fieldApi: { setMeta: (fn: (prev: any) => any) => void }) {
  fieldApi.setMeta((prev: any) => ({
    ...prev,
    errorMap: { ...prev.errorMap, onServer: undefined },
  }))
}
