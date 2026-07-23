export type FieldMetaLike = {
  isTouched: boolean
  errors: unknown[]
}

export function fieldIsErrorAfterTouched(meta: FieldMetaLike) {
  return meta.isTouched && meta.errors.length > 0
}
