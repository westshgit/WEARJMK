export type CreateError = {
  message: string
  reason: 'ConstraintError' | 'RecordExist'
}
