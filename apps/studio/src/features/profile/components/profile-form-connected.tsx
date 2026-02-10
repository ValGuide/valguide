import { useSuspenseQuery } from '@tanstack/react-query'
import { getImageKitUrl } from '@valguide/core/features/assets/image-url'
import { currentUserQueryOptions } from '@valguide/core/features/auth/query-options'
import { updateProfileFn } from '@valguide/core/features/profiles/update-profile.fn'
import { updateProfileAvatarFn } from '@valguide/core/features/profiles/update-profile-avatar.fn'
import { uploadFileWithTUS } from '@/features/assets/lib/tus-upload'
import { useProfile } from '../hooks/use-profile'
import { ProfileAvatarForm } from './profile-avatar-form'
import { ProfileForm } from './profile-form'

export function ProfileFormConnected() {
  const { profile, refetch } = useProfile()
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username || ''

  const currentAvatarUrl = profile.avatarStoragePath ? getImageKitUrl(profile.avatarStoragePath) : null

  const handleUploadAndSaveAvatar = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const storagePath = `profile-avatars/${profile.id}/${crypto.randomUUID()}.${ext}`

    await uploadFileWithTUS({
      bucketName: 'assets',
      fileName: storagePath,
      file,
    })

    await updateProfileAvatarFn({
      data: { storagePath },
    })

    await refetch()
  }

  return (
    <div className="space-y-6">
      <ProfileAvatarForm
        currentAvatarUrl={currentAvatarUrl}
        displayName={displayName}
        onUploadAndSave={handleUploadAndSaveAvatar}
      />
      <ProfileForm
        profile={profile}
        email={user?.email}
        onSubmit={async (data) => {
          try {
            await updateProfileFn({ data })
            return { success: true }
          } catch {
            return { success: false }
          }
        }}
        onSuccess={refetch}
      />
    </div>
  )
}
