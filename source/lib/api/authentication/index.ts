'use server'

import { z } from 'zod'
import { login as payloadLogin, logout as payloadLogout } from '@payloadcms/next/auth'
import config from '@payload-config'
import { ActionResult } from '@/lib/shared'
import type { User } from '@/payload-types'
import { getPayloadAPI } from '../shared'
import { createAccountSchema, loginSchema, forgotPasswordSchema, updateAccountSchema } from '@/lib/schema/authentication' // <-- adjust to wherever you export these

function zodErrorToFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'formError'
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message
  }
  return fieldErrors
}

/**
 * Normalizes Payload's thrown errors (ValidationError, AuthenticationError,
 * LockedAuth, NotVerified, etc.) into an ActionResult failure shape.
 */
function mapPayloadError(error: unknown, fallbackMessage: string): { success: false; formError?: string; fieldErrors?: Record<string, string> } {
  if (error && typeof error === 'object') {
    const err = error as {
      name?: string
      message?: string
      status?: number
      data?: Array<{ field?: string; path?: string; message: string }>
    }

    if (err.name === 'ValidationError' && Array.isArray(err.data)) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of err.data) {
        const key = issue.field ?? issue.path ?? 'formError'
        fieldErrors[key] = issue.message
      }
      return { success: false, formError: 'Please fix the errors below.', fieldErrors }
    }

    if (err.name === 'AuthenticationError' || err.status === 401) {
      // Deliberately generic — don't reveal whether the email is registered.
      return { success: false, formError: 'The email or password you entered is incorrect.' }
    }

    if (err.name === 'LockedAuth' || err.status === 423) {
      return {
        success: false,
        formError: 'This account has been temporarily locked due to too many failed login attempts. Please try again later or reset your password.',
      }
    }

    if (err.name === 'NotVerified') {
      return { success: false, formError: 'Please verify your email address before logging in.' }
    }
  }

  console.error(fallbackMessage, error)
  return { success: false, formError: fallbackMessage }
}

export type CreateUserAccountArgs = {
  email: string
  password: string
  passwordConfirm: string
}

export async function createUserAccount(args: CreateUserAccountArgs): Promise<ActionResult<User>> {
  const parsed = createAccountSchema.safeParse(args)
  if (!parsed.success) {
    return {
      success: false,
      formError: 'Please fix the errors below.',
      fieldErrors: zodErrorToFieldErrors(parsed.error),
    }
  }

  const { email, password } = parsed.data
  const payload = await getPayloadAPI()

  try {
    const user = await payload.create({
      collection: 'users',
      data: { email, password },
    })

    // Auto sign-in the new user. Not fatal if it fails — the account still exists.
    // `login` is Payload's Next.js server function — it sets the auth cookie itself.
    try {
      await payloadLogin({ collection: 'users', config, email, password })
    } catch (loginError) {
      console.error('Auto-login after account creation failed:', loginError)
    }

    return { success: true, data: user }
  } catch (error) {
    return mapPayloadError(error, 'There was an error creating your account. Please try again.')
  }
}

export type LoginArgs = {
  email: string
  password: string
}

export async function login(args: LoginArgs): Promise<ActionResult<User>> {
  const parsed = loginSchema.safeParse(args)
  if (!parsed.success) {
    return {
      success: false,
      formError: 'Please fix the errors below.',
      fieldErrors: zodErrorToFieldErrors(parsed.error),
    }
  }

  const { email, password } = parsed.data

  try {
    // Sets the auth cookie automatically — no manual `cookies().set()` needed.
    const result = await payloadLogin({ collection: 'users', config, email, password })

    if (!result?.user) return { success: false, formError: 'Login succeeded but no user data was returned. Please try again.' }

    return { success: true, data: result.user }
  } catch (error) {
    return mapPayloadError(error, 'The email or password you entered is incorrect.')
  }
}

export type ForgotPasswordArgs = {
  email: string
}

export async function forgotPassword(args: ForgotPasswordArgs): Promise<ActionResult<null>> {
  const parsed = forgotPasswordSchema.safeParse(args)
  if (!parsed.success) {
    return {
      success: false,
      formError: 'Please fix the errors below.',
      fieldErrors: zodErrorToFieldErrors(parsed.error),
    }
  }

  const payload = await getPayloadAPI()

  try {
    await payload.forgotPassword({
      collection: 'users',
      data: { email: parsed.data.email },
    })
  } catch (error) {
    // Log server-side, but never leak whether the email is registered.
    console.error('forgotPassword error:', error)
  }

  return { success: true, data: null }
}

export type UpdateUserAccountArgs = {
  userId: number
  name?: string
  email?: string
  password?: string
  passwordConfirm?: string
}

export async function updateUserAccount(args: UpdateUserAccountArgs): Promise<ActionResult<User>> {
  const { userId, name = '', email = '', password = '', passwordConfirm = '' } = args

  const parsed = updateAccountSchema.safeParse({ name, email, password, passwordConfirm })
  if (!parsed.success) {
    return {
      success: false,
      formError: 'Please fix the errors below.',
      fieldErrors: zodErrorToFieldErrors(parsed.error),
    }
  }

  const payload = await getPayloadAPI()

  let currentUser: User
  try {
    currentUser = await payload.findByID({ collection: 'users', id: userId })
  } catch (error) {
    return mapPayloadError(error, 'We could not find your account. Please try logging in again.')
  }

  // Only send fields that actually changed.
  const diff: Record<string, unknown> = {}
  if (parsed.data.name !== currentUser.name) diff.name = parsed.data.name
  if (parsed.data.email !== currentUser.email) diff.email = parsed.data.email
  if (parsed.data.password) diff.password = parsed.data.password // '' means "no change"

  if (Object.keys(diff).length === 0) {
    return { success: true, data: currentUser }
  }

  try {
    const updatedUser = await payload.update({
      collection: 'users',
      id: userId,
      data: diff,
    })

    // If the password changed, re-issue the session so the current login stays valid.
    // `login` refreshes the auth cookie itself — no manual token/cookie handling.
    if (diff.password) {
      try {
        await payloadLogin({
          collection: 'users',
          config,
          email: updatedUser.email,
          password: parsed.data.password,
        })
      } catch (loginError) {
        console.error('Re-authentication after password change failed:', loginError)
      }
    }

    return { success: true, data: updatedUser }
  } catch (error) {
    return mapPayloadError(error, 'There was an error updating your account. Please try again.')
  }
}

export async function logout(): Promise<ActionResult<null>> {
  try {
    // Clears the auth cookie for you.
    await payloadLogout({ config })
    return { success: true, data: null }
  } catch (error) {
    console.error('logout error:', error)
    return { success: false, formError: 'There was an error logging out. Please try again.' }
  }
}
