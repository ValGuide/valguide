import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Field, FieldDescription, FieldError, FieldLabel } from '@valguide/core/ui/components/field'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Input } from '@valguide/ui/components/input'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import type { ProfileFormData } from '../schemas'

const profileSchema = z.object({
  username: z.string().refine((val) => val === '' || val.length >= 3, {
    message: 'Username must be at least 3 characters',
  }),
  firstName: z.string(),
  lastName: z.string(),
})

export type UpdateProfileResult = { success: boolean; validationError?: boolean }

export interface ProfileFormProps {
  initialData?: {
    username?: string | null
    firstName?: string | null
    lastName?: string | null
  }
  profile?: {
    username: string | null
    firstName: string | null
    lastName: string | null
  } | null
  isLoading?: boolean
  onSubmit?: (data: ProfileFormData) => Promise<UpdateProfileResult>
  onSuccess?: () => Promise<void>
}

export function ProfileForm({
  initialData,
  profile: profileProp,
  isLoading: isLoadingProp,
  onSubmit,
  onSuccess,
}: ProfileFormProps) {
  const t = useTranslations('profile')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const queryClient = useQueryClient()
  const profile = profileProp
  const isLoading = isLoadingProp ?? false

  const form = useForm({
    defaultValues: {
      username: initialData?.username || '',
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      if (!onSubmit) return
      startTransition(async () => {
        const result = await onSubmit(value)
        if (result.success) {
          toast.success(t('actions.updateSuccess'))
          router.invalidate()
          await onSuccess?.()
          await queryClient.invalidateQueries({ queryKey: ['sidebar'] })
        } else {
          toast.error(t('actions.updateError'))
        }
      })
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
      })
    }
  }, [profile, form])

  if (isLoading && !initialData) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="username"
            children={(field) => {
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
                  <FieldDescription>{t('usernameDescription')}</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="firstName"
              children={(field) => {
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
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />
            <form.Field
              name="lastName"
              children={(field) => {
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
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? t('saving') : t('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
