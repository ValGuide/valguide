import { useForm, useStore } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Field, FieldError, FieldLabel } from '@valguide/core/ui/components/field'
import { PhoneInput } from '@valguide/core/ui/components/phone-input'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Skeleton } from '@valguide/ui/components/skeleton'
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

export type UpdateProfileResult = { success: boolean; validationError?: boolean }

export interface ProfileFormProps {
  initialData?: {
    username?: string | null
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
  }
  profile?: {
    username: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
  } | null
  email?: string
  isLoading?: boolean
  onSubmit?: (data: ProfileFormData) => Promise<UpdateProfileResult>
  onSuccess?: () => Promise<void>
}

export function ProfileForm({
  initialData,
  profile: profileProp,
  email,
  isLoading: isLoadingProp,
  onSubmit,
  onSuccess,
}: ProfileFormProps) {
  const t = useTranslations('profile')
  const [isPending, startTransition] = useTransition()
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle')
  const router = useRouter()
  const queryClient = useQueryClient()
  const profile = profileProp
  const isLoading = isLoadingProp ?? false

  const form = useForm({
    defaultValues: {
      username: initialData?.username ?? '',
      firstName: initialData?.firstName ?? '',
      lastName: initialData?.lastName ?? '',
      phone: initialData?.phone ?? '',
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      if (!onSubmit) return
      startTransition(async () => {
        const result = await onSubmit(value)
        if (result.success) {
          setSaveState('saved')
          router.invalidate()
          await onSuccess?.()
          await queryClient.invalidateQueries({ queryKey: ['sidebar'] })
        } else {
          toast.error(t('actions.updateError'))
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

  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username ?? '',
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
      })
    }
  }, [profile, form])

  const handleReset = useCallback(() => {
    form.reset({
      username: profile?.username ?? '',
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      phone: profile?.phone ?? '',
    })
  }, [form, profile])

  if (isLoading && !initialData) {
    return <ProfileFormSkeleton />
  }

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
                  <div className="min-h-5">{isInvalid && <FieldError errors={field.state.meta.errors} />}</div>
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
                  <div className="min-h-5">{isInvalid && <FieldError errors={field.state.meta.errors} />}</div>
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
                  placeholder="jdoe"
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
                placeholder={t('phonePlaceholder')}
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

function ProfileFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t pt-4">
        <Skeleton className="h-3 w-24" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}
