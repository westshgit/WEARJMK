'use client'
import { createUserAccount } from '@/lib/api/authentication'
import { useForm, revalidateLogic } from '@tanstack/react-form'
import { fieldIsErrorAfterTouched } from '@/components/forms/shared.api'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { FormFieldError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { applyServerFieldErrors, clearServerErrorOnChange, useServerActionWithState } from '@/lib/client.api'
import { createAccountSchema, emailSchema, passwordSchema } from '@/lib/schema'
import { toast } from 'sonner'
import { cn } from '@/utilities'
import { RiEye2Fill, RiEyeCloseFill } from '@remixicon/react'

export const CreateAccountForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useMemo(() => searchParams.get('redirect'), [searchParams])
  const router = useRouter()
  const [eyes, setEyes] = useState<'open' | 'close'>('close')

  const { runAction, isPending } = useServerActionWithState({
    action: createUserAccount,
    onSuccess: (result) => {
      console.log('Account created successfully:', result.data)
      // Redirect to the specified page after account creation, if applicable
      if (redirect) {
        router.push(redirect)
        return
      }
      router.push(`/account?success=${encodeURIComponent('Account created successfully')}`)
    },
    onError: (result) => {
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

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
    validators: {
      onDynamic: createAccountSchema,
      onMount: createAccountSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value }) => {
      runAction(value)
    },
  })

  return (
    <div className="p-2">
      <Card className="mx-auto mt-20 w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl font-bold">Create Account</h1>
          </CardTitle>
          <CardDescription>
            <p>Create an account to access exclusive features and personalized experiences. Fill in the form below to get started.</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            <form.Field
              name="email"
              validators={{
                onBlur: emailSchema,
                onChange: emailSchema,
              }}
              listeners={{ onChange: ({ fieldApi }) => clearServerErrorOnChange(fieldApi) }}
            >
              {(field) => (
                <FormItem>
                  <Label htmlFor={field.name}>
                    <h4 className="text-base">Email Address</h4>
                  </Label>
                  <Input
                    className={cn('h-12', fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                    autoComplete="email"
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}

                    placeholder="Enter your email"
                    type="email"
                    value={field.state.value}
                  />

                  <FormFieldError meta={field.state.meta} />
                </FormItem>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: passwordSchema,
                onBlur: passwordSchema,
              }}
            >
              {(field) => (
                <FormItem>
                  <Label htmlFor={field.name}>
                    <h4 className="text-base">New Password</h4>
                  </Label>
                  <div className="relative">
                    <Input
                      autoComplete="new-password"
                      className={cn('h-12', fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="Enter a new password"
                      type={eyes === 'open' ? 'text' : 'password'}
                      value={field.state.value}
                    />
                    <Button className="absolute right-2 top-2" onClick={() => setEyes(eyes === 'open' ? 'close' : 'open')} type="button" variant="ghost">
                      {eyes === 'open' ? <RiEye2Fill /> : <RiEyeCloseFill />}
                    </Button>
                  </div>
                  <FormFieldError meta={field.state.meta} />
                </FormItem>
              )}
            </form.Field>

            <form.Field
              name="passwordConfirm"
              validators={{
                onChangeListenTo: ['password'],
                onChange: ({ value, fieldApi }) => {
                  if (!value) return 'Please confirm your password.'
                  if (value !== fieldApi.form.getFieldValue('password')) {
                    return 'The passwords do not match.'
                  }
                  return undefined
                },
                onBlur: ({ value, fieldApi }) => {
                  if (!value) return 'Please confirm your password.'
                  if (value !== fieldApi.form.getFieldValue('password')) {
                    return 'The passwords do not match.'
                  }
                  return undefined
                },
              }}
            >
              {(field) => (
                <FormItem>
                  <Label htmlFor={field.name}>
                    <h4 className="text-base">Confirm Password</h4>
                  </Label>
                  <Input
                    autoComplete="new-password"
                    className={cn('h-12', fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Confirm your password"
                    type={eyes === 'open' ? 'text' : 'password'}
                    value={field.state.value}
                  />
                  <FormFieldError meta={field.state.meta} />
                </FormItem>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting, canSubmit: state.canSubmit })}>
              {({ isSubmitting, canSubmit }) => (
                <Button className="w-full" disabled={isSubmitting || isPending || !canSubmit} type="submit">
                  {isSubmitting ? 'Processing' : 'Create Account'}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <div className="prose dark:prose-invert mt-8 text-sm">
            <p>
              {'Already have an account? '}
              <Link href={`/login${allParams}`}>Login</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
