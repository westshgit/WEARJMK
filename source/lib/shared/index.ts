export type SuccessResult<T> = {
  success: true
  data: T
}

export type FailureResult = {
  success: false
  formError?: string
  fieldErrors?: Record<string, string>
}

export type ActionResult<T> = SuccessResult<T> | FailureResult
