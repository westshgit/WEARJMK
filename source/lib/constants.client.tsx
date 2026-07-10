'use client'

import { RiLoginBoxLine, RiUserAddLine } from '@remixicon/react'

export function getErrorMessage(value: unknown): string {
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value
  if ('error' in (value as any) && typeof (value as any).error === 'string') {
    return (value as any).error
  }
  if ('message' in (value as any) && typeof (value as any).message === 'string') {
    return (value as any).message
  }
  return 'An unexpected error occurred'
}

export const LOGIN_MESSAGE = "please log in to access this page. If you don't have an account, please sign up."
export const LOGOUT_MESSAGE = 'You have been logged out successfully.'
export const LOGIN_SUCCESS_MESSAGE = 'You have been logged in successfully.'
export const CREATE_ACCOUNT = 'please create an account to access this page.'
export const FORGOT_PASSWORD_MESSAGE = 'Please check your email for instructions to reset your password.'

export const LOGIN_ICON = <RiLoginBoxLine />
export const CREATE_ACCOUNT_ICON = <RiUserAddLine />
