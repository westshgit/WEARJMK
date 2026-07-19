import { z } from 'zod'

export const addressSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  company: z.string(),
  addressLine1: z.string().min(1, 'Address line 1 is required.'),
  addressLine2: z.string(),
  city: z.string().min(1, 'City is required.'),
  state: z.string(),
  postalCode: z.string().min(1, 'Postal code is required.'),
  country: z.string().min(1, 'Country is required.'),
})
