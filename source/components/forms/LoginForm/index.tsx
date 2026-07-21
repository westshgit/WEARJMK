'use client'

import { AnimatePresence, motion } from 'motion/react'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { ArrowLeftIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { Wizard, useWizard } from 'react-use-wizard'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from 'sonner'
import { RiEye2Fill, RiEyeCloseFill } from '@remixicon/react'
import { FormFieldError } from '@/components/forms/FormError'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { emailSchema, loginSchema, passwordSchema } from '@/lib/schema/authentication'
import { applyServerFieldErrors, clearServerErrorOnChange, useServerActionWithState } from '@/utilities'
import { login } from '@/lib/api/authentication'
import { fieldIsErrorAfterTouched } from '../shared.api'
import { cn } from '@/utilities/cn'

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams()
  const redirect = useMemo(() => searchParams.get('redirect'), [searchParams])
  const router = useRouter()
  const [eyes, setEyes] = useState<'open' | 'close'>('close')

  const { runAction, isPending } = useServerActionWithState({
    action: login,
    onSuccess: (result) => {
      if (redirect) {
        router.push(redirect)
        return
      }
      router.push(`/shop?success=${encodeURIComponent('Logged in successfully')}`)
    },
    onError: (result) => {
      if (result.formError)
        toast.error(result.formError, {
          duration: 5000,
          icon: '❌',
          position: 'top-center',
        })

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
    },
    validators: {
      onDynamic: loginSchema,
      onMount: loginSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value }) => {
      runAction(value)
    },
  })

  return (
    <div className="p-2">
      <Card className="mx-auto mt-20 w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl font-bold">Log in</h1>
          </CardTitle>
          <CardDescription>
            <p>Log in to your account to manage your orders and other settings</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                void form.handleSubmit()
              }}
            >
              <Wizard wrapper={<WizardMotionWrapper />}>
                <form.Field
                  name="email"
                  validators={{
                    onBlur: emailSchema,
                    onChange: emailSchema,
                  }}

                  listeners={{ onChange: ({ fieldApi }) => clearServerErrorOnChange(fieldApi) }}
                >
                  {(field) => {
                    return (
                      <FormItem>
                        <Label htmlFor={field.name}>
                          <h4 className="text-base">Email</h4>
                        </Label>
                        <Input
                          className={cn('h-12', fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                          autoComplete="email"
                          autoFocus
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          placeholder="Enter your email"
                          type="email"
                          value={field.state.value}
                        />

                        <FormFieldError meta={field.state.meta} />
                        {field.state.meta.isValid && field.state.value.length > 0 ? <NextButton /> : null}
                      </FormItem>
                    )
                  }}
                </form.Field>

                <form.Field
                  name="password"
                  validators={{
                    onChange: passwordSchema,
                    onBlur: passwordSchema,
                  }}
                >
                  {(field) => (
                    <>
                      <div className="flex items-center justify-between gap-3 mb-10 border shadow bg-muted/40 p-2 rounded">
                        <div className="min-w-0">
                          <h6>Email</h6>
                          <p className="truncate text-sm font-medium text-foreground/50">{form.state.values.email}</p>
                        </div>

                        <PreviousButton />
                      </div>
                      <FormItem>
                        <Label htmlFor={field.name}>
                          <h4 className="text-base">Password</h4>
                        </Label>
                        <div className="relative">
                          <Input
                            autoComplete="current-password"
                            autoFocus
                            id={field.name}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(event) => field.handleChange(event.target.value)}
                            placeholder="Enter your password"
                            type={eyes === 'open' ? 'text' : 'password'}
                            className={cn('h-12', fieldIsErrorAfterTouched(field.state.meta) ? 'border-destructive! ring-destructive!' : '')}
                            value={field.state.value}
                          />

                          <Button
                            aria-label={eyes === 'open' ? 'Hide password' : 'Show password'}
                            aria-pressed={eyes === 'open'}
                            className="absolute right-2 top-2"
                            variant={'ghost'}
                            type="button"
                            onClick={() => setEyes(eyes === 'open' ? 'close' : 'open')}
                          >
                            {eyes === 'open' ? <RiEye2Fill /> : <RiEyeCloseFill />}
                          </Button>
                        </div>
                        <FormFieldError meta={field.state.meta} />
                      </FormItem>

                      {field.state.meta.isValid && field.state.value.length > 0 ? (
                        <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting, canSubmit: state.canSubmit })}>
                          {({ isSubmitting, canSubmit }) => (
                            <Button className="w-full mt-6" disabled={isSubmitting || isPending || !canSubmit} type="submit">
                              {isSubmitting ? 'Processing' : 'Log in'}
                            </Button>
                          )}
                        </form.Subscribe>
                      ) : null}
                    </>
                  )}
                </form.Field>
              </Wizard>
            </form>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link className="transition-colors hover:text-foreground hover:underline" href={`/forgot-password`}>
                Forgot your password?
              </Link>
              <Link className="transition-colors hover:text-foreground hover:underline" href={`/create-account`}>
                Create an account
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WizardMotionWrapper({ children }: { children?: React.ReactNode }) {
  const { activeStep } = useWizard()

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={activeStep}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        initial={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

function NextButton() {
  const { nextStep } = useWizard()

  return (
    <Button className="w-full uppercase mt-3" onClick={nextStep} size="sm" type="button">
      Continue
    </Button>
  )
}

function PreviousButton() {
  const { previousStep } = useWizard()

  return (
    <Button className="flex items-center" onClick={previousStep} size="sm" type="button" variant="ghost">
      <ArrowLeftIcon className="size-4" />
      <span>Change</span>
    </Button>
  )
}
