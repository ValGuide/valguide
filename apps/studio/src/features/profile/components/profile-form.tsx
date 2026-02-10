import { useForm, useStore } from '@tanstack/react-form'
import { useTranslations } from '@valguide/core/i18n/client'
import { Field, FieldError, FieldLabel } from '@valguide/core/ui/components/field'
import { PhoneInput } from '@valguide/core/ui/components/phone-input'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Lock } from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { z } from 'zod'
import type { ProfileFormData } from '../schemas'

const profileSchema = z.object({
  username: z.string().refine((val) => val === '' || val.length >= 3, {
    message: 'Please use at least 3 characters, or leave it blank.',
  }),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
})

export interface ProfileFormProps {
  profile: {
    username: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
  }
  email?: string
  onSubmit: (data: ProfileFormData) => Promise<{ success: boolean }>
}

export function ProfileForm({ profile, email, onSubmit }: ProfileFormProps) {
  const t = useTranslations('profile')
  const [isPending, startTransition] = useTransition()
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle')

  const form = useForm({
    defaultValues: {
      username: profile.username ?? '',
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      phone: profile.phone ?? '',
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        const result = await onSubmit(value)
        if (result.success) {
          form.reset(value)
          setSaveState('saved')
        }
      })
    },
  })

  const isDirty = !useStore(form.store, (state) => state.isDefaultValue)

  useEffect(() => {
    if (saveState === 'saved') {
      const timer = setTimeout(() => setSaveState('idle'), 2500)
      return () => clearTimeout(timer)
    }
  }, [saveState])

  const handleReset = useCallback(() => {
    form.reset()
  }, [form])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field name="firstName">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t('firstName')}</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="John"
                  />
                  <div>{isInvalid && <FieldError errors={field.state.meta.errors} />}</div>
                </Field>
              )
            }}
          </form.Field>
          <form.Field name="lastName">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t('lastName')}</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Doe"
                  />
                  <div>{isInvalid && <FieldError errors={field.state.meta.errors} />}</div>
                </Field>
              )
            }}
          </form.Field>
        </div>
      </div>

      <div className="space-y-4">
        <form.Field name="username">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t('username')}</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder={email?.split('@')[0]}
                />
                <div className="min-h-5">{isInvalid && <FieldError errors={field.state.meta.errors} />}</div>
              </Field>
            )
          }}
        </form.Field>
        <Field>
          <div className="flex items-center gap-1.5">
            <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
            <Lock className="size-3.5 text-muted-foreground" />
          </div>
          <Input
            id="email"
            value={email ?? ''}
            disabled
            className="bg-muted text-muted-foreground cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">{t('emailChangeHint')}</p>
        </Field>
        <form.Field name="phone">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>{t('phone')}</FieldLabel>
              <PhoneInput
                id={field.name}
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                defaultCountry="CH"
                placeholder="079 123 45 67"
              />
              <p className="text-xs text-muted-foreground">{t('phoneHint')}</p>
            </Field>
          )}
        </form.Field>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          {isPending ? t('saving') : isDirty ? t('unsavedChanges') : saveState === 'saved' ? t('saved') : '\u00A0'}
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={isPending || !isDirty}>
            {t('reset')}
          </Button>
          <Button type="submit" size="sm" disabled={isPending || !isDirty}>
            {isPending ? t('saving') : t('save')}
          </Button>
        </div>
      </div>
    </form>
  )
}
