import type { z } from 'zod'

export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}

  for (const issue of error.issues) {
    const path = issue.path.join('.')
    // first error per field wins — don't overwrite if we already have one
    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message
    }
  }

  return fieldErrors
}
