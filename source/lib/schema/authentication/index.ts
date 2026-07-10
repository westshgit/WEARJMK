import { z } from 'zod'

export const emailSchema = z.email('Enter a valid email address.').min(1, 'Please provide an email address.')
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be 72 characters or fewer.') // bcrypt truncates beyond this
  .regex(/[a-z]/, 'Include at least one lowercase letter.')
  .regex(/[A-Z]/, 'Include at least one uppercase letter.')
  .regex(/[0-9]/, 'Include at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Include at least one special character.')

export const createAccountSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'The passwords do not match.',
    path: ['passwordConfirm'],
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const updateAccountSchema = z
  .object({
    name: z.string().min(1, 'Please provide your name.'),
    email: emailSchema,
    password: z.union([z.literal(''), z.string().min(8, 'Too short')]),
    passwordConfirm: z.union([z.literal(''), z.string()]),
  })
  .refine((data) => data.password === data.passwordConfirm, { message: "Passwords don't match", path: ['passwordConfirm'] })
