import { ReactNode } from 'react'

interface ConditionProps {
  predicate: boolean | (() => boolean)
  children: ReactNode | ((predicateResult: boolean) => ReactNode)
}

export default function Condition({ predicate, children }: ConditionProps) {
  const result = typeof predicate === 'function' ? predicate() : predicate
  if (!result) return null
  const _children = typeof children === 'function' ? children(result) : children
  return <>{_children}</>
}
