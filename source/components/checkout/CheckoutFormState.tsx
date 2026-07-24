// Thin shape TanStack Form actually needs to manage state for.

import { initializePayment, InitializePaymentArgs } from '@/lib/api/payment.api'
import { useAddresses, useCurrency } from '@/patches/dist/exports/client/react'
import { Address, Cart, User } from '@/payload-types'
import { applyServerFieldErrors, useServerActionWithState } from '@/utilities/useServerActionWithState'
import { toast } from '@payloadcms/ui'
import { useForm, useSelector } from '@tanstack/react-form'

// No relations, no giant literal unions to walk, no `id`/timestamps.
export type AddressFormValues = {
  id?: number
  title?: string
  firstName?: string
  lastName?: string
  company?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string // widened from the 140-literal union — validate at submit, not at the type level
  phone?: string
  createdAt?: string
  updatedAt?: string
}

export type FormShape = {
  email: string
  editableEmail: boolean
  shippingAddress: AddressFormValues | undefined
  billingAddressSameAsShipping: boolean
  billingAddress: AddressFormValues | undefined
}

export function useCheckoutFormState({ user, cart }: { user?: User; cart: Cart }) {
  const { addresses } = useAddresses()

  const {
    runAction,
    isPending: formIsPending,
    state: paymentState,
  } = useServerActionWithState({
    action: (args) => initializePayment(args as InitializePaymentArgs),
    onSuccess: (result) => {
      toast.success('Redirecting you to payment...')
      console.log('Payment initialized successfully:', result)
    },
    onError: (result) => {
      console.error('Error initializing payment:', result)
      if (result.formError) toast.error(result.formError)

      if (result.fieldErrors) {
        const unmatched = applyServerFieldErrors(form, result.fieldErrors)
        if (unmatched.length > 0) {
          for (const [_, message] of unmatched) {
            toast.error(message)
          }
        }
      }
    },
  })

  const defaultValues: FormShape = {
    email: user?.email ?? '',
    editableEmail: true,
    shippingAddress: undefined as AddressFormValues | undefined,
    billingAddressSameAsShipping: true,
    billingAddress: toFormValues(addresses?.[0]),
  }

  const form = useForm({
    defaultValues,
    onSubmit: ({ value: { billingAddress, billingAddressSameAsShipping, email, shippingAddress } }) => {
      if (!billingAddress || (!billingAddressSameAsShipping && !shippingAddress) || !email) {
        toast.error('Please fill out all required fields.')
        return
      }

      void runAction({
        cart,
        email,
        billingAddress,
        shippingAddress: {
          ...(billingAddressSameAsShipping ? { sameAsBilling: true } : { sameAsBilling: false, address: shippingAddress }),
        },
      })
    },
  })

  const email = useSelector(form.store, (state) => state.values.email)
  const editableEmail = useSelector(form.store, (state) => state.values.editableEmail)
  const billingAddress = useSelector(form.store, (state) => state.values.billingAddress)
  const shippingAddress = useSelector(form.store, (state) => state.values.shippingAddress)
  const billingAddressSameAsShipping = useSelector(form.store, (state) => state.values.billingAddressSameAsShipping)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length
  const canGoToPayment = Boolean((email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress))

  return {
    form,
    email,
    editableEmail,
    billingAddress,
    shippingAddress,
    billingAddressSameAsShipping,
    cartIsEmpty,
    canGoToPayment,
    formIsPending,
    paymentState,
  }
}

export type CheckoutFormState = ReturnType<typeof useCheckoutFormState>

export function toFormValues(address: Address | undefined): AddressFormValues | undefined {
  if (!address) return undefined
  const { id, title, firstName, lastName, company, addressLine1, addressLine2, city, state, postalCode, country, phone, createdAt, updatedAt } = address
  return {
    id: id ?? undefined,
    createdAt: createdAt ?? undefined,
    updatedAt: updatedAt ?? undefined,
    title: title ?? undefined,
    firstName: firstName ?? undefined,
    lastName: lastName ?? undefined,
    company: company ?? undefined,
    addressLine1: addressLine1 ?? undefined,
    addressLine2: addressLine2 ?? undefined,
    city: city ?? undefined,
    state: state ?? undefined,
    postalCode: postalCode ?? undefined,
    country: country ?? undefined,
    phone: phone ?? undefined,
  }
}
