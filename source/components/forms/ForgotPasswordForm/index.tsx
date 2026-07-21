'use client'

import { useForm, revalidateLogic } from '@tanstack/react-form'
import { emailSchema } from '@/lib/schema/authentication'
import Link from 'next/link'
import { FormFieldError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPasswordSchema } from '@/lib/schema/authentication'
import { applyServerFieldErrors, useServerActionWithState } from '@/utilities'
import { toast } from 'sonner'
import { forgotPassword } from '@/lib/api'
import { fieldIsErrorAfterTouched } from '../shared.api'
import { cn } from '@/utilities/cn'

export const ForgotPasswordForm: React.FC = () => {
  const { runAction, isPending } = useServerActionWithState({
    action: forgotPassword,
    onSuccess: (result) => {
      toast.success('Password reset email sent successfully')
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
    },
    validators: {
      onDynamic: forgotPasswordSchema,
      onMount: forgotPasswordSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value }) => {
      runAction(value)
    },
  })

  return (
    <Card className="mx-auto mt-20 w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <h1 className="text-3xl font-bold">Forgot Password</h1>
        </CardTitle>
        <CardDescription>
          <p>
            {`Please enter your email below. You will receive an email message with instructions on
                how to reset your password. To manage your all users, `}
            <Link className="underline hover:text-foreground" href="/admin/collections/users">
              login to the admin dashboard
            </Link>
            .
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
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
          >
            {(field) => (
              <FormItem className="mb-8">
                <Label htmlFor={field.name}>
                  <h4 className="text-base">Email address</h4>
                </Label>
                <Input
                  autoComplete="email"
                  autoFocus
                  className={cn('h-12', fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
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

          <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting, canSubmit: state.canSubmit })}>
            {({ isSubmitting, canSubmit }) => (
              <Button className="w-full" disabled={isSubmitting || isPending || !canSubmit} type="submit">
                {isSubmitting ? 'Sending' : 'Forgot Password'}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  )
}
