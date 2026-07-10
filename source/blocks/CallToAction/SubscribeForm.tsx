'use client'

import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),

  email: z.email('Please enter a valid email address'),
})

type FormValues = z.infer<typeof schema>

export function SubscribeForm() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
    } satisfies FormValues,

    validators: {
      onSubmit: schema,
    },

    onSubmit: async ({ value }) => {
      console.log(value)

      // await fetch('/api/subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify(value),
      // })
    },
  })

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="name"
        children={(field) => (
          <div className="space-y-2">
            <h2 className="text-base font-semibold">Your Name</h2>

            <Input placeholder="John Doe" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />

            {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
          </div>
        )}
      />

      <form.Field
        name="email"
        children={(field) => (
          <div className="space-y-2">
            <h2 className="text-base font-semibold">Email Address</h2>

            <Input
              type="email"
              placeholder="john@example.com"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />

            {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
          </div>
        )}
      />

      <Button type="submit" className="w-full">
        Subscribe
      </Button>
    </form>
  )
}
