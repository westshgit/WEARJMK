'use client'

import { updateUserAccount } from '@/lib/api/authentication'
import { useForm, revalidateLogic } from '@tanstack/react-form'
import { fieldIsErrorAfterTouched } from '@/components/forms/shared.api'
import React from 'react'
import { FormFieldError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { applyServerFieldErrors, clearServerErrorOnChange, useServerActionWithState } from '@/utilities/'
import { emailSchema, passwordSchema, updateAccountSchema } from '@/lib/schema/authentication'
import { toast } from 'sonner'
import { cn } from '@/utilities'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User } from '@/payload-types'

export const AccountForm: React.FC<{ user: User }> = ({ user }) => {
  const { runAction, isPending } = useServerActionWithState({
    action: ({ name, email, password, passwordConfirm }: { name: string; email: string; password?: string; passwordConfirm?: string }) =>
      updateUserAccount({ userId: user.id, name, email, password, passwordConfirm }),
    onSuccess: (_) => {
      toast.success('Account updated successfully.')
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
      name: user.name ?? '',
      email: user.email,
      password: '',
      passwordConfirm: '',
    },
    validators: {
      onDynamic: updateAccountSchema,
      onMount: updateAccountSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value }) => {
      runAction(value)
    },
  })

  return (
    <form
      className="w-full max-w-xl"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Account Details</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 pt-6">
          <form.Field
            name="name"
            validators={{
              onBlur: ({ value }) => (!value ? 'Please provide your name.' : undefined),
              onChange: ({ value }) => (!value ? 'Please provide your name.' : undefined),
            }}
            listeners={{ onChange: ({ fieldApi }) => clearServerErrorOnChange(fieldApi) }}
          >
            {(field) => (
              <FormItem>
                <Label htmlFor={field.name}>
                  <h4 className="text-base">Name</h4>
                </Label>
                <Input
                  className={cn('h-12', fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                  autoComplete="name"
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Enter your name"
                  type="text"
                  value={field.state.value}
                />
                <FormFieldError meta={field.state.meta} />
              </FormItem>
            )}
          </form.Field>

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
        </TabsContent>

        <TabsContent value="password" className="space-y-6 pt-6">
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined
                const result = passwordSchema.safeParse(value)
                if (!result.success) return result.error.issues[0].message
                return undefined
              },
              onBlur: ({ value }) => {
                if (!value) return undefined
                const result = passwordSchema.safeParse(value)
                if (!result.success) return result.error.issues[0].message
                return undefined
              },
            }}
            listeners={{ onChange: ({ fieldApi }) => clearServerErrorOnChange(fieldApi) }}
          >
            {(field) => (
              <FormItem>
                <Label htmlFor={field.name}>
                  <h4 className="text-base">New Password</h4>
                </Label>
                <Input
                  className={cn('h-12', fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                  autoComplete="new-password"
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Enter a new password"
                  type="password"
                  value={field.state.value}
                />
                <FormFieldError meta={field.state.meta} />
              </FormItem>
            )}
          </form.Field>

          <form.Field
            name="passwordConfirm"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) => {
                const password = fieldApi.form.getFieldValue('password')
                if (password && !value) return 'Please confirm your password.'
                if (value !== password) return 'The passwords do not match.'
                return undefined
              },
              onBlur: ({ value, fieldApi }) => {
                const password = fieldApi.form.getFieldValue('password')
                if (password && !value) return 'Please confirm your password.'
                if (value !== password) return 'The passwords do not match.'
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
                  className={cn('h-12', fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                  autoComplete="new-password"
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Confirm your new password"
                  type="password"
                  value={field.state.value}
                />
                <FormFieldError meta={field.state.meta} />
              </FormItem>
            )}
          </form.Field>
        </TabsContent>
      </Tabs>

      <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting, canSubmit: state.canSubmit })}>
        {({ isSubmitting, canSubmit }) => (
          <Button className="mt-8" disabled={isSubmitting || isPending || !canSubmit} type="submit">
            {isSubmitting ? 'Processing' : 'Update Account'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
