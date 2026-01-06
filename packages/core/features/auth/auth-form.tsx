'use client'

import { Link } from '@valguide/i18n/routing'
import { Button } from '@valguide/ui/components/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@valguide/ui/components/field'
import { Input } from '@valguide/ui/components/input'
import { useTranslations } from '@valguide/core/i18n/mock'
import { type FormEvent, useState } from 'react'

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

  // Local state for validation
  const [error, setError] = useState<string | null>(null)

  // Handle form submission
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!initialEmail) {
      setError(t('emailRequired'))
      return
    }
    if (!emailRegex.test(initialEmail)) {
      setError(t('invalidEmail'))
      return
    }

    setError(null)
    onSubmit(initialEmail)
  }

  return (
    <div className="flex flex-col justify-center">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">{emailLabel}</FieldLabel>
            <Input
              id="email"
              placeholder={emailPlaceholder}
              type="email"
              autoComplete="email"
              value={initialEmail}
              onChange={(e) => {
                onEmailChange(e.target.value)
                setError(null) // Clear error on change
              }}
              required
            />
            {error && <FieldDescription className="text-destructive">{error}</FieldDescription>}
          </Field>

          <Field>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? loadingText : submitText}
            </Button>
          </Field>

          <div className="text-center">
            <p className="text-sm">
              {isLogin ? t('noAccount') : t('haveAccount')}{' '}
              <Link href={isLogin ? '/signup' : '/login'} className="text-secondary-foreground hover:underline">
                {isLogin ? t('signupLink') : t('loginLink')}
              </Link>
            </p>
          </div>
        </FieldGroup>
      </form>
    </div>
  )
}
