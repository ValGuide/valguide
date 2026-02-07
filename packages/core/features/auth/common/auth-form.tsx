import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@valguide/ui/components/field'
import { Input } from '@valguide/ui/components/input'
import { type FormEvent, useState } from 'react'

export interface AuthFormProps {
  email: string
  onEmailChange: (email: string) => void
  onSubmit: (email: string) => void
  loading?: boolean
}

export function AuthForm({ email: initialEmail, onEmailChange, onSubmit, loading = false }: AuthFormProps) {
  const t = useTranslations('auth')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
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

        <p className="text-sm text-muted-foreground text-center">{t('loginCodeNote')}</p>
      </form>
    </div>
  )
}
