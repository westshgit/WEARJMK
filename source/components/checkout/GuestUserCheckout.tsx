import { useWizard, Wizard } from 'react-use-wizard'
import { CheckoutFormState, toFormValues } from './CheckoutFormState'
import Link from 'next/link'
import { Button } from '../ui/button'
import { LogIn, Mail, MapPin, Pencil, UserPlus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Condition from '../Condition'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { FormItem } from '../forms/FormItem'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { CreateAddressModal } from '../addresses/CreateAddressModal'
import { AddressItem } from '../addresses/AddressItem'
import { Address } from '@/payload-types'
import { FormFieldError } from '../forms/FormError'
import { fieldIsErrorAfterTouched } from '../forms/shared.api'
import { cn } from '@/utilities/cn'
import { emailSchema } from '@/lib/schema/authentication'
import { Checkbox } from '../ui/checkbox'

export default function GuestUserCheckout({
  formState: { form, editableEmail, email, billingAddress, billingAddressSameAsShipping, shippingAddress },
}: {
  formState: CheckoutFormState
}) {
  return (
    <>
      <Wizard wrapper={<AnimatedWizardWrapper />}>
        <Condition predicate={true}>
          {(_) => {
            const { nextStep } = useWizard()
            return (
              <Card className="max-w-md!">
                <CardHeader>
                  <CardTitle className="uppercase text-2xl">Contact</CardTitle>
                  <CardDescription>Enter your email to checkout as a guest.</CardDescription>
                </CardHeader>

                <CardContent>
                  <form.Field
                    name="email"
                    validators={{
                      onChange: emailSchema,
                      onBlur: emailSchema,
                      onMount: emailSchema,
                    }}
                  >
                    {(field) => (
                      <FormItem className="mb-6">
                        <Label htmlFor="email" className="font-mono! uppercase text-sm">
                          Email Address
                        </Label>
                        <Input
                          disabled={!editableEmail}
                          className={cn('h-12', fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                          id="email"
                          name="email"
                          onChange={(e) => {
                            field.handleChange(e.target.value)
                          }}
                          required
                          type="email"
                          value={field.state.value}
                        />

                        <FormFieldError meta={field.state.meta} />
                      </FormItem>
                    )}
                  </form.Field>

                  <form.Subscribe
                    selector={(state) => {
                      return { emailIsValid: state.fieldMeta.email?.isValid }
                    }}
                  >
                    {({ emailIsValid = false }) => (
                      <form.Field name="editableEmail">
                        {(field) => (
                          <Button
                            disabled={!email || !emailIsValid}
                            onClick={(e) => {
                              e.preventDefault()
                              field.handleChange(false)
                              nextStep()
                            }}
                            variant="default"
                            className="uppercase"
                          >
                            Continue
                          </Button>
                        )}
                      </form.Field>
                    )}
                  </form.Subscribe>
                </CardContent>
              </Card>
            )
          }}
        </Condition>

        <Condition predicate={true}>
          {(_) => {
            const { nextStep, previousStep, activeStep } = useWizard()

            return (
              <Card className="max-w-md!">
                <CardHeader>
                  <CardTitle className="uppercase text-2xl">Address</CardTitle>
                  <CardDescription>Let's get your addresses right.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    {billingAddress ? (
                      <AddressItem
                        actions={
                          <form.Field name="billingAddress">
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
                        address={billingAddress}
                      />
                    ) : (
                      <form.Field name="billingAddress">
                        {(field) => (
                          <CreateAddressModal
                            disabled={!email || editableEmail}
                            callback={(address) => {
                              if (!address) return
                              field.handleChange(toFormValues(address as Address))
                            }}
                            skipSubmission={true}
                          />
                        )}
                      </form.Field>
                    )}

                    <form.Field name="billingAddressSameAsShipping">
                      {(field) => (
                        <div className="flex gap-4 items-center">
                          <Checkbox
                            id="shippingTheSameAsBilling"
                            checked={field.state.value}
                            disabled={Boolean(!email || Boolean(editableEmail))}
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
                  </div>

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
                            <CreateAddressModal
                              buttonText="Add Shipping Address"
                              disabled={!email || editableEmail}
                              callback={(address) => {
                                if (!address) return
                                field.handleChange(toFormValues(address as Address))
                              }}
                              skipSubmission={true}
                            />
                          )}
                        </form.Field>
                      )}
                    </>
                  )}

                  <div className="flex gap-2">
                    <form.Field name="editableEmail">
                      {(field) => {
                        return (
                          <Button
                            variant="ghost"
                            className="uppercase flex-1 shadow!"
                            onClick={(e) => {
                              e.preventDefault()
                              // If the user is on the address step and they click "Back",
                              // we want to make sure that the email field is editable again so they can change it if needed.
                              if (activeStep === 1) field.handleChange(true)
                              previousStep()
                            }}
                          >
                            Back
                          </Button>
                        )
                      }}
                    </form.Field>
                    <Button
                      disabled={!billingAddress}
                      variant="default"
                      className="uppercase flex-1 shadow!"
                      onClick={(e) => {
                        e.preventDefault()
                        nextStep()
                      }}
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          }}
        </Condition>

        <Condition predicate={true}>
          {(_) => {
            const { goToStep } = useWizard()

            return (
              <Card className="max-w-md!">
                <CardHeader>
                  <CardTitle className="uppercase text-2xl">Review</CardTitle>
                  <CardDescription>Confirm your details before continuing to payment.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="size-4 shrink-0 text-muted-foreground" />
                      {email}
                    </div>
                    <form.Field name="editableEmail">
                      {(field) => (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault()
                            goToStep(0)
                            field.handleChange(true)
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                    </form.Field>
                  </div>

                  {billingAddress && (
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                        <AddressItem address={billingAddress} />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault()
                          goToStep(1)
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          }}
        </Condition>
      </Wizard>

      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="font-medium text-xl uppercase">JSYK</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            You can log in or create an account to save your favorites, manage your orders, and enjoy a faster checkout.
          </p>
        </div>

        <div className="w-full flex gap-2 *:basis-full *:*:w-full max-w-md *:*:cursor-pointer">
          <Link href={'/login'}>
            <Button variant={'outline'} className="uppercase gap-2">
              <LogIn className="size-4 shrink-0" />
              Sign In
            </Button>
          </Link>

          <Link href={'/create-account'}>
            <Button variant={'outline'} className="uppercase gap-2">
              <UserPlus className="size-4 shrink-0" />
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}

export function AnimatedWizardWrapper({ children }: { children?: React.ReactNode }) {
  const { activeStep } = useWizard()

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, x: 30, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -30, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
