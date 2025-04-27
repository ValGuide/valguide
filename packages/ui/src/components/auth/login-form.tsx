'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import * as z from 'zod'

import { Button } from '../button'
import { Input } from '@valguide/ui/components/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@valguide/ui/components/form'

export interface LoginFormProps {
  /**
   * The email value
   */
  email: string
  /**
   * Callback when email changes
   */
  onEmailChange: (email: string) => void
  /**
   * Callback when form is submitted
   */
  onSubmit: (email: string) => void
  /**
   * Whether the form is in loading state
   */
  loading?: boolean
  /**
   * Text for the submit button
   */
  submitText: string
  /**
   * Text for the submit button when loading
   */
  loadingText: string
  /**
   * Label for the email input
   */
  emailLabel: string
  /**
   * Placeholder for the email input
   */
  emailPlaceholder: string
}

/**
 * A form component for email login
 */
export function LoginForm({
  email: initialEmail,
  onEmailChange,
  onSubmit,
  loading = false,
  submitText,
  loadingText,
  emailLabel,
  emailPlaceholder,
}: LoginFormProps) {
  // Get translations
  const t = useTranslations('login')

  // Define form schema with zod
  const formSchema = z.object({
    email: z.string().email({ message: t('invalidEmail') }),
  })
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialEmail,
    },
  })

  // Handle form submission
  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values.email)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-8 space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{emailLabel}</FormLabel>
              <FormControl>
                <Input
                  placeholder={emailPlaceholder}
                  type="email"
                  autoComplete="email"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    onEmailChange(e.target.value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? loadingText : submitText}
        </Button>
      </form>
    </Form>
  )
}
