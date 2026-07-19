'use server'
import { ActionResult } from '@/lib/shared'
import type { User } from '@/payload-types'

export type CreateUserAccountArgs = {
  email: string
  password: string
  passwordConfirm: string
}

export async function createUserAccount(args: CreateUserAccountArgs): Promise<ActionResult<User>> {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate a delay for demonstration purposes

  console.log('Submitting server form with values:', args)
  return {
    success: false,
    formError: 'There was an error creating your account. Please try again.',
    fieldErrors: {
      email: 'Email is already in use',
      otherField: 'This field has an error',
    },
  }
}

export type LoginArgs = {
  email: string
  password: string
}

export async function login(args: LoginArgs): Promise<ActionResult<User>> {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate a delay for demonstration purposes

  console.log('Submitting server form with values:', args)
  return {
    success: false,
    formError: 'There was an error logging in. Please try again.',
    fieldErrors: {
      email: 'Email is not registered',
      password: 'Incorrect password',
    },
  }
}

export type ForgotPasswordArgs = {
  email: string
}

export async function forgotPassword(args: ForgotPasswordArgs): Promise<ActionResult<null>> {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate a delay for demonstration purposes
  console.log('Submitting server form with values:', args)
  return {
    success: false,
    formError: 'There was an error sending the password reset email. Please try again.',
    fieldErrors: {
      email: 'Email is not registered',
    },
  }
}

export type UpdateUserAccountArgs = {
  userId: number
  name?: string
  email?: string
  password?: string
  passwordConfirm?: string
}

export async function updateUserAccount(args: UpdateUserAccountArgs): Promise<ActionResult<User>> {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate a delay for demonstration purposes

  console.log(`Updating user account for userId: ${args.userId} with values:`, args)
  return {
    success: false,
    formError: 'There was an error updating your account. Please try again.',
    fieldErrors: {
      email: 'Email is already in use',
      password: 'Password does not meet requirements',
    },
  }
}

export async function logout(): Promise<ActionResult<null>> {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate a delay for demonstration purposes

  return {
    success: false,
    formError: 'There was an error logging out. Please try again.',
  }
}

// const logout = useCallback<Logout>(async () => {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`, {
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       method: 'POST',
//     })

//     if (res.ok) {
//       setUser(null)
//       setStatus('loggedOut')
//     } else {
//       throw new Error('An error occurred while attempting to logout.')
//     }
//   } catch (e) {
//     throw new Error('An error occurred while attempting to logout.')
//   }
// }, [])
