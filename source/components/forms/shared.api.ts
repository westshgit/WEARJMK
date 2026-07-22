export type FieldMetaLike = {
  isTouched: boolean
  errors: unknown[]
}

export function fieldIsErrorAfterTouched(meta: FieldMetaLike) {
  console.log('fieldIsErrorAfterTouched', meta.isTouched, meta.errors)
  return meta.isTouched && meta.errors.length > 0
}
