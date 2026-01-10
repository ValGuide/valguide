import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@valguide/ui/components/form'
import { Input } from '@valguide/ui/components/input'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import type { ProfileFormData } from '../schemas'

const profileSchema = z.object({
  username: z.string().min(3).optional().or(z.literal('')),
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
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

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: initialData?.username || '',
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
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

  function handleFormSubmit(formData: ProfileFormData) {
    if (!onSubmit) return
    startTransition(async () => {
      const result = await onSubmit(formData)
      if (result.success) {
        toast.success(t('actions.updateSuccess'))
        router.invalidate()
        await onSuccess?.()
        await queryClient.invalidateQueries({ queryKey: ['sidebar'] })
      } else {
        toast.error(t('actions.updateError'))
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('username')}</FormLabel>
                  <FormControl>
                    <Input placeholder="jdoe" {...field} />
                  </FormControl>
                  <FormDescription>{t('usernameDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('firstName')}</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lastName')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('saving') : t('save')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
