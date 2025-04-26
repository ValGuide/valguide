'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@valguide/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@valguide/ui/components/form'
import { Input } from '@valguide/ui/components/input'
import { createLogger } from '@valguide/logger'
import { useEmailLogin } from '@/app/[locale]/(auth)/login/email/email-login.provider'
import { useMemo } from 'react'

const log = createLogger('login-email-form')

export type EmailLoginFormProps = {
  i18n: {
    submit: string
    serverError: string
    email: {
      message: string
      placeholder: string
    }
  }
}

export function EmailLoginForm({ i18n }: EmailLoginFormProps) {
  const { onSubmit } = useEmailLogin()

  const formSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({
          message: i18n.email.message,
        }),
      }),
    [i18n.email.message],
  )

  type FormSchema = z.infer<typeof formSchema>

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmitCallback: SubmitHandler<FormSchema> = async (data) => {
    try {
      await onSubmit(data)
    } catch (e) {
      log.error('Failed to log in', e)
      form.setError('email', { type: 'server', message: i18n.serverError })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitCallback)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder={i18n.email.placeholder}
                  data-testid="email-input"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" data-testid="submit-button" disabled={form.formState.isSubmitting}>
          {i18n.submit}
        </Button>
      </form>
    </Form>
  )
}
