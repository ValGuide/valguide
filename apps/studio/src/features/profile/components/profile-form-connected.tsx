import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { getImageKitUrl } from '@valguide/core/features/assets/image-url'
import { currentUserQueryOptions } from '@valguide/core/features/auth/query-options'
import type { Profile } from '@valguide/core/features/profiles/get-or-create-profile.fn'
import { updateProfileFn } from '@valguide/core/features/profiles/update-profile.fn'
import { updateProfileAvatarFn } from '@valguide/core/features/profiles/update-profile-avatar.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { Separator } from '@valguide/core/ui/components/separator'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { uploadFileWithTUS } from '@/features/assets/lib/tus-upload'
import { profileQueryOptions } from '../query-options'
import type { ProfileFormData } from '../schemas'
import { ProfileAvatarForm } from './profile-avatar-form'
import { ProfileForm } from './profile-form'

export function ProfileFormConnected() {
  const t = useTranslations('profile')
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: profile } = useSuspenseQuery(profileQueryOptions())
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())

  const emailPrefix = user?.email?.split('@')[0] ?? ''
  const profileWithDefaults = {
    ...profile,
    username: profile.username || emailPrefix,
  }

  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profileWithDefaults.username || ''
  const currentAvatarUrl = profile.avatarStoragePath ? getImageKitUrl(profile.avatarStoragePath) : null

  const handleUploadAndSaveAvatar = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const storagePath = `users/${profile.id}/profile-avatars/${crypto.randomUUID()}.${ext}`

    await uploadFileWithTUS({
      bucketName: 'assets',
      fileName: storagePath,
      file,
    })

    await updateProfileAvatarFn({ data: { storagePath } })
    await queryClient.invalidateQueries({ queryKey: ['profile'] })
  }

  const handleSubmit = async (data: ProfileFormData): Promise<{ success: boolean }> => {
    try {
      await updateProfileFn({ data })

      queryClient.setQueryData<Profile>(profileQueryOptions().queryKey, (old) => {
        if (!old) return old
        return { ...old, ...data }
      })

      queryClient.invalidateQueries({ queryKey: ['sidebar'] })
      router.invalidate()

      return { success: true }
    } catch {
      toast.error(t('actions.updateError'))
      return { success: false }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('avatar')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProfileAvatarForm
          currentAvatarUrl={currentAvatarUrl}
          displayName={displayName}
          onUploadAndSave={handleUploadAndSaveAvatar}
        />
        <Separator />
        <ProfileForm profile={profileWithDefaults} email={user?.email} onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  )
}
