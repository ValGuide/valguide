'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@valguide/ui/components/button'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { updateProfileAction, type ProfileFormData } from '../actions'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

const profileSchema = z.object({
  username: z.string().min(3).optional().or(z.literal('')),
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
})

interface ProfileFormProps {
  initialData: {
    username?: string | null
    firstName?: string | null
    lastName?: string | null
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const t = useTranslations('profile')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: initialData.username || '',
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
    },
  })

  function onSubmit(data: ProfileFormData) {
    startTransition(async () => {
      const result = await updateProfileAction(data)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.message)
        router.refresh()
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('username')}</FormLabel>
                  <FormControl>
                    <Input placeholder="jdoe" {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('usernameDescription')}
                  </FormDescription>
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
