'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Address, Config } from '@/payload-types'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { useForm, revalidateLogic } from '@tanstack/react-form'
import { FormFieldError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { defaultCountries } from '@/lib/defaultCountries'
import { deepMergeSimple } from 'payload/shared'
import { titles } from './constants'
import { addressSchema, validatePhone, validatePostalCode } from '@/lib/schema/address'
import { cn } from '@/utilities'
import { fieldIsErrorAfterTouched } from '@/components/forms/shared.api'
import { useWizard, Wizard } from 'react-use-wizard'
import Condition from '@/components/Condition'
import { RiEdit2Fill } from '@remixicon/react'

type Props = {
  addressID?: Config['db']['defaultIDType']
  initialData?: Omit<Address, 'country' | 'id' | 'updatedAt' | 'createdAt'> & { country?: string }
  callback?: (data: Partial<Address>) => void
  skipSubmission?: boolean
}

export const AddressForm: React.FC<Props> = ({ addressID, initialData, callback, skipSubmission }) => {
  const { createAddress, updateAddress } = useAddresses()

  const form = useForm({
    defaultValues: {
      title: initialData?.title ?? '',
      firstName: initialData?.firstName ?? '',
      lastName: initialData?.lastName ?? '',
      company: initialData?.company ?? '',
      addressLine1: initialData?.addressLine1 ?? '',
      addressLine2: initialData?.addressLine2 ?? '',
      city: initialData?.city ?? '',
      state: initialData?.state ?? '',
      postalCode: initialData?.postalCode ?? '',
      country: initialData?.country ?? '',
      phone: initialData?.phone ?? '',
    },
    validators: {
      onDynamic: addressSchema,
      onMount: addressSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const newData = deepMergeSimple(initialData || {}, value)

      if (!skipSubmission) {
        if (addressID) {
          await updateAddress(addressID, newData)
        } else {
          await createAddress(newData)
        }
      }

      if (callback) {
        callback(newData)
      }
    },
  })

  // pure, no meta mutation, no touching
  function getStepValidity(values: typeof form.state.values, step: number) {
    if (step === 0) {
      return !!values.firstName && !!values.lastName && !!values.phone && !validatePhone(values.phone, values.country)
    }
    return !!values.addressLine1 && !!values.city && !!values.country && !validatePostalCode(values.postalCode, values.country)
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <Wizard
        header={
          <div className="flex flex-col gap-4 mb-6">
            <Condition predicate={true}>
              {/* Header */}
              {(_) => {
                const { activeStep, stepCount, isFirstStep, isLastStep, nextStep, previousStep } = useWizard()
                const stepLabels = ['Contact Information', 'Address Information']

                return (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="text-sm">{stepLabels[activeStep]}</h6>
                        <span className="text-xs text-muted-foreground">
                          Step {activeStep + 1} of {stepCount}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: stepCount }).map((_, i) => (
                          <div key={i} className={cn('h-1.5 flex-1 rounded-full', i <= activeStep ? 'bg-primary' : 'bg-muted')} />
                        ))}
                      </div>
                    </div>
                    <form.Subscribe selector={(state) => getStepValidity(state.values, 0)}>
                      {(firstStepValid) => {
                        return (
                          <Condition predicate={isFirstStep && !isLastStep && firstStepValid!!}>
                            <div className="flex items-center justify-end">
                              <Button onClick={nextStep}>Continue</Button>
                            </div>
                          </Condition>
                        )
                      }}
                    </form.Subscribe>

                    <form.Subscribe selector={(state) => getStepValidity(state.values, 1)}>
                      {(lastStepValid) => {
                        return (
                          <Condition predicate={() => isLastStep && !isFirstStep && lastStepValid}>
                            <div className="flex items-center justify-end">
                              <Button onClick={previousStep} variant={'outline'}>
                                <RiEdit2Fill /> Edit Contact Info
                              </Button>
                            </div>
                          </Condition>
                        )
                      }}
                    </form.Subscribe>
                  </div>
                )
              }}
            </Condition>
          </div>
        }
      >
        <div className="space-y-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-start gap-4 max-md:w-full">
              <form.Field name="title">
                {(field) => (
                  <FormItem className="shrink">
                    <Label htmlFor={field.name}>Title</Label>
                    <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Title" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        {titles.map((title) => (
                          <SelectItem key={title} value={title}>
                            {title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormFieldError className="text-xs" meta={field.state.meta} />
                  </FormItem>
                )}
              </form.Field>

              <form.Field
                name="firstName"
                validators={{
                  onBlur: ({ value }) => (!value ? 'First name is required.' : undefined),
                  onChange: ({ value }) => (!value ? 'First name is required.' : undefined),
                }}
              >
                {(field) => (
                  <FormItem className="max-md:flex-1">
                    <Label htmlFor={field.name}>First name*</Label>
                    <Input
                      className={cn(fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                      autoComplete="given-name"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      value={field.state.value}
                    />
                    <FormFieldError className="text-xs" meta={field.state.meta} />
                  </FormItem>
                )}
              </form.Field>
            </div>

            <form.Field
              name="lastName"
              validators={{
                onBlur: ({ value }) => (!value ? 'Last name is required.' : undefined),
                onChange: ({ value }) => (!value ? 'Last name is required.' : undefined),
              }}
            >
              {(field) => (
                <FormItem>
                  <Label htmlFor={field.name}>Last name*</Label>
                  <Input
                    className={cn(fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                    autoComplete="family-name"
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    value={field.state.value}
                  />
                  <FormFieldError className="text-xs" meta={field.state.meta} />
                </FormItem>
              )}
            </form.Field>
          </div>

          <form.Field
            name="phone"
            validators={{
              onChangeListenTo: ['country'],
              onBlur: ({ value, fieldApi }) => validatePhone(value, fieldApi.form.getFieldValue('country')),
              onChange: ({ value, fieldApi }) => validatePhone(value, fieldApi.form.getFieldValue('country')),
            }}
          >
            {(field) => (
              <FormItem>
                <Label htmlFor={field.name}>Phone*</Label>
                <Input
                  className={cn(fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                  type="tel"
                  id={field.name}
                  autoComplete="tel"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="+234 801 234 5678"
                  value={field.state.value}
                />
                <FormFieldError meta={field.state.meta} />
              </FormItem>
            )}
          </form.Field>

          <form.Field name="company">
            {(field) => (
              <FormItem>
                <Label htmlFor={field.name}>Company(optional)</Label>
                <Input
                  id={field.name}
                  autoComplete="organization"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  value={field.state.value}
                />
                <FormFieldError meta={field.state.meta} />
              </FormItem>
            )}
          </form.Field>
        </div>

        <div className="space-y-6 mb-6">
          <form.Field
            name="addressLine1"
            validators={{
              onBlur: ({ value }) => (!value ? 'Address line 1 is required.' : undefined),
              onChange: ({ value }) => (!value ? 'Address line 1 is required.' : undefined),
            }}
          >
            {(field) => (
              <FormItem>
                <Label htmlFor={field.name}>Address line 1*</Label>
                <Input
                  className={cn(fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                  id={field.name}
                  autoComplete="address-line1"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  value={field.state.value}
                />
                <FormFieldError meta={field.state.meta} />
              </FormItem>
            )}
          </form.Field>

          <form.Field name="addressLine2">
            {(field) => (
              <FormItem>
                <Label htmlFor={field.name}>Address line 2</Label>
                <Input
                  id={field.name}
                  autoComplete="address-line2"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  value={field.state.value}
                />
                <FormFieldError meta={field.state.meta} />
              </FormItem>
            )}
          </form.Field>

          <form.Field
            name="city"
            validators={{
              onBlur: ({ value }) => (!value ? 'City is required.' : undefined),
              onChange: ({ value }) => (!value ? 'City is required.' : undefined),
            }}
          >
            {(field) => (
              <FormItem>
                <Label htmlFor={field.name}>City*</Label>
                <Input
                  className={cn(fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                  id={field.name}
                  autoComplete="address-level2"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  value={field.state.value}
                />
                <FormFieldError meta={field.state.meta} />
              </FormItem>
            )}
          </form.Field>

          <form.Field name="state">
            {(field) => (
              <FormItem>
                <Label htmlFor={field.name}>State*</Label>
                <Input
                  id={field.name}
                  autoComplete="address-level1"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  value={field.state.value}
                />
                <FormFieldError meta={field.state.meta} />
              </FormItem>
            )}
          </form.Field>

          <div className="flex items-start gap-2 *:basis-full">
            <form.Field
              name="postalCode"
              validators={{
                onChangeListenTo: ['country'],
                onBlur: ({ value, fieldApi }) => validatePostalCode(value, fieldApi.form.getFieldValue('country')),
                onChange: ({ value, fieldApi }) => validatePostalCode(value, fieldApi.form.getFieldValue('country')),
              }}
            >
              {(field) => (
                <FormItem>
                  <Label htmlFor={field.name}>Zip Code*</Label>
                  <Input
                    className={cn(fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    value={field.state.value}
                  />
                  <FormFieldError meta={field.state.meta} />
                </FormItem>
              )}
            </form.Field>
            <form.Field
              name="country"
              validators={{
                onBlur: ({ value }) => (!value ? 'Country is required.' : undefined),
                onChange: ({ value }) => (!value ? 'Country is required.' : undefined),
              }}
            >
              {(field) => (
                <FormItem>
                  <Label htmlFor={field.name}>Country*</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (value === 'NG') form.setFieldValue('postalCode', '100001') // Set default postal code for Nigeria
                      field.handleChange(value)
                    }}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultCountries.map((country) => {
                        const value = typeof country === 'string' ? country : country.value
                        const label = typeof country === 'string' ? country : typeof country.label === 'string' ? country.label : value

                        return (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormFieldError meta={field.state.meta} />
                </FormItem>
              )}
            </form.Field>
          </div>
        </div>
      </Wizard>

      <form.Subscribe
        selector={(state) => ({
          isSubmitting: state.isSubmitting,
          isValid: getStepValidity(state.values, 0) && getStepValidity(state.values, 1),
        })}
      >
        {({ isSubmitting, isValid }) => (
          <div className="flex items-center justify-center">
            <Button disabled={isSubmitting || !isValid} type="submit" className="w-full max-w-75">
              {isSubmitting ? 'Saving...' : 'Create Address'}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}
