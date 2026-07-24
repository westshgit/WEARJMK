import { Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { CheckoutFormState, toFormValues } from './CheckoutFormState'
import { Address, User } from '@/payload-types'
import { AddressItem } from '../addresses/AddressItem'
import { Button } from '../ui/button'
import { CheckoutAddresses } from './CheckoutAddresses'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'

const maskEmail = (email: string) => {
  const [name, domain] = email.split('@')
  if (!name || !domain) return email
  const maskedName = name.length <= 2 ? name[0] + '*' : name.slice(0, 2) + '*'.repeat(name.length - 2)
  return `${maskedName}@${domain}`
}

export default function LoggedInUserCheckout({
  formState: { form, billingAddress, formIsPending, paymentState, billingAddressSameAsShipping, shippingAddress, email },
  user,
}: {
  formState: CheckoutFormState
  user: User
}) {
  return (
    <Card className="md:max-w-md!">
      <CardHeader>
        <CardTitle className="uppercase text-2xl">Hey {user?.name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Mail className="size-4 shrink-0" />
          {user?.email ? maskEmail(user.email) : null}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form.Field name="billingAddress">
          {(field) => (
            <>
              {billingAddress ? (
                <AddressItem
                  actions={
                    <Button
                      className="uppercase"
                      variant={'destructive'}
                      disabled={formIsPending || Boolean(paymentState?.success)}
                      onClick={(e) => {
                        e.preventDefault()
                        field.handleChange(undefined)
                      }}
                    >
                      Remove
                    </Button>
                  }
                  address={billingAddress}
                />
              ) : (
                <CheckoutAddresses
                  heading="Billing address"
                  description="Please select a billing address."
                  setAddress={(address) => {
                    if (!address) return
                    field.handleChange(toFormValues(address as Address))
                  }}
                />
              )}
            </>
          )}
        </form.Field>

        <form.Field name="billingAddressSameAsShipping">
          {(field) => (
            <div className="flex gap-4 items-center">
              <Checkbox
                id="shippingTheSameAsBilling"
                checked={field.state.value}
                disabled={Boolean(!email)}
                onCheckedChange={(state) => {
                  field.handleChange(state as boolean)
                }}
              />
              <Label htmlFor="shippingTheSameAsBilling" className="uppercase text-xs">
                Shipping is the same as billing
              </Label>
            </div>
          )}
        </form.Field>

        {!billingAddressSameAsShipping && (
          <>
            {shippingAddress ? (
              <AddressItem
                actions={
                  <form.Field name="shippingAddress">
                    {(field) => (
                      <Button
                        variant={'destructive'}
                        className="uppercase"
                        size={'sm'}
                        onClick={(e) => {
                          e.preventDefault()
                          field.handleChange(undefined)
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </form.Field>
                }
                address={shippingAddress}
              />
            ) : (
              <form.Field name="shippingAddress">
                {(field) => (
                  <CheckoutAddresses
                    heading="Shipping address"
                    description="Please select a shipping address."
                    setAddress={(address) => {
                      if (!address) return
                      field.handleChange(toFormValues(address as Address))
                    }}
                  />
                )}
              </form.Field>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
