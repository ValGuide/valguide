import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@valguide/ui/components/field'
import { Input } from '@valguide/ui/components/input'
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
}

/**
 * A form component for unified email authentication
 */
export function AuthForm({ email: initialEmail, onEmailChange, onSubmit, loading = false }: AuthFormProps) {
  const t = useTranslations('auth')

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
            <FieldLabel htmlFor="email">{t('emailLabel')}</FieldLabel>
            <Input
              id="email"
              placeholder={t('emailPlaceholder')}
              type="email"
              autoComplete="email"
              value={initialEmail}
              onChange={(e) => {
                onEmailChange(e.target.value)
                setError(null)
              }}
              required
            />
            {error && <FieldDescription className="text-destructive">{error}</FieldDescription>}
          </Field>

          <Field>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('sending') : t('sendCode')}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
