'use client'

import { useForm, revalidateLogic } from '@tanstack/react-form'
import { fieldIsErrorAfterTouched } from '@/components/forms/shared.api'
import React, { useState } from 'react'
import { FormFieldError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { applyServerFieldErrors, clearServerErrorOnChange, useServerActionWithState } from '@/utilities'
import { emailSchema } from '@/lib/schema/authentication'
import { toast } from 'sonner'
import { cn } from '@/utilities'
import { sendOrderAccessEmail, SendOrderAccessEmailArgs } from './sendOrderAccessEmail'
import { z } from 'zod'
import type { User } from '@/payload-types'

const findOrderSchema = z.object({
  email: emailSchema,
  orderID: z.string().min(1, 'Order ID is required.'),
})

type FormData = {
  email: string
  orderID: string
}

type Props = {
  user?: User | null
}

export const FindOrderForm: React.FC<Props> = ({ user }) => {
  const [success, setSuccess] = useState(false)

  const { runAction, isPending } = useServerActionWithState({
    action: sendOrderAccessEmail,
    onSuccess: () => setSuccess(true),
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
      email: user?.email || '',
      orderID: '',
    } satisfies FormData,
    validators: {
      onDynamic: findOrderSchema,
      onMount: findOrderSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value }) => runAction(value satisfies SendOrderAccessEmailArgs),
  })

  if (success) {
    return (
      <div className="p-2">
        <Card className="mx-auto mt-20 w-full max-w-md">
          <CardHeader>
            <CardTitle>
              <h1 className="text-3xl font-bold">Check your email</h1>
            </CardTitle>
            <CardDescription>
              <p>If an order exists with the provided email and order ID, we&apos;ve sent you an email with a link to view your order details.</p>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-2">
      <Card className="mx-auto mt-20 w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl font-bold">Find my order</h1>
          </CardTitle>
          <CardDescription>
            <p>Please enter your email and order ID below. We&apos;ll send you a link to view your order.</p>
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
                    <h4 className="text-base">Email address</h4>
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
              name="orderID"
              validators={{
                onBlur: z.string().min(1, 'Order ID is required.'),
                onChange: z.string().min(1, 'Order ID is required.'),
              }}
              listeners={{ onChange: ({ fieldApi }) => clearServerErrorOnChange(fieldApi) }}
            >
              {(field) => (
                <FormItem>
                  <Label htmlFor={field.name}>
                    <h4 className="text-base">Order ID</h4>
                  </Label>
                  <Input
                    className={cn('h-12', fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                    autoComplete="off"
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Enter your order ID"
                    type="text"
                    value={field.state.value}
                  />
                  <FormFieldError meta={field.state.meta} />
                </FormItem>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting, canSubmit: state.canSubmit })}>
              {({ isSubmitting, canSubmit }) => (
                <Button className="w-full" disabled={isSubmitting || isPending || !canSubmit} type="submit">
                  {isSubmitting ? 'Sending...' : 'Find order'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
