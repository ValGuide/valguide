'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import * as z from 'zod'
import Link from 'next/link'

import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@valguide/ui/components/form'

export interface AuthFormProps {
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
  /**
   * Whether this is a login form (true) or signup form (false)
   */
  isLogin?: boolean
}

/**
 * A form component for email authentication (login or signup)
 */
export function AuthForm({
  email: initialEmail,
  onEmailChange,
  onSubmit,
  loading = false,
  submitText,
  loadingText,
  emailLabel,
  emailPlaceholder,
  isLogin = false,
}: AuthFormProps) {
  // Get translations
  const t = useTranslations(isLogin ? 'login' : 'signup')

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
    <div className="flex flex-col justify-center  relative">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-8 space-y-6" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{emailLabel}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={emailPlaceholder}
                    type="text"
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

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {isLogin ? t('noAccount') : t('haveAccount')}{' '}
              <Link href={isLogin ? '/signup' : '/login'} className="text-blue-600 hover:underline">
                {isLogin ? t('signupLink') : t('loginLink')}
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  )
}
