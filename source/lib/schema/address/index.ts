import { z } from 'zod'

// --- Phone validation --------------------------------------------------
const e164 = /^\+?[1-9]\d{7,14}$/

const phonePatterns: Record<string, RegExp> = {
  NG: /^(\+?234|0)[789]\d{9}$/,
  US: /^\+?1?\d{10}$/,
  CA: /^\+?1?\d{10}$/,
  GB: /^(\+?44|0)\d{9,10}$/,
}

function normalizePhone(value: string): string {
  return value.replace(/[\s().-]/g, '')
}

export function validatePhone(value: string, country?: string): string | undefined {
  if (!value) return 'Phone number is required.'
  const normalized = normalizePhone(value)
  const pattern = country ? phonePatterns[country] : undefined
  const isValid = pattern ? pattern.test(normalized) : e164.test(normalized)
  if (!isValid) {
    return 'Enter a valid phone number, including the area code.'
  }
  return undefined
}

// --- Postal code validation ---------------------------------------------
const postalCodePatterns: Record<string, RegExp> = {
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  GB: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/,
  NG: /^\d{6}$/,
}

const genericPostalCode = /^[A-Za-z0-9\s-]{3,10}$/

export function validatePostalCode(value: string, country?: string): string | undefined {
  if (!value) return 'Postal code is required.'
  const pattern = country ? postalCodePatterns[country] : undefined
  if (!(pattern ?? genericPostalCode).test(value)) {
    return 'Enter a valid postal code for the selected country.'
  }
  return undefined
}

// --- Address schema -------------------------------------------------------
export const addressSchema = z
  .object({
    title: z.string().min(1, 'Title is required.'),
    firstName: z.string().trim().min(1, 'First name is required.').max(50, 'First name is too long.'),
    lastName: z.string().trim().min(1, 'Last name is required.').max(50, 'Last name is too long.'),
    phone: z.string().min(1, 'Phone number is required.'),
    company: z.string().max(100, 'Company name is too long.'),
    addressLine1: z.string().trim().min(3, 'Address line 1 is required.').max(200, 'Address is too long.'),
    addressLine2: z.string().max(200, 'Address is too long.'),
    city: z.string().trim().min(1, 'City is required.').max(100, 'City name is too long.'),
    state: z.string().max(100, 'State is too long.'),
    postalCode: z.string().min(1, 'Postal code is required.'),
    country: z.string().min(1, 'Country is required.'),
  })
  .superRefine((data, ctx) => {
    const phoneError = validatePhone(data.phone, data.country)
    if (phoneError) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: phoneError })
    }

    const postalCodeError = validatePostalCode(data.postalCode, data.country)
    if (postalCodeError) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['postalCode'], message: postalCodeError })
    }
  })
