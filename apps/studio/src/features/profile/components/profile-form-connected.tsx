import { updateProfileFn } from '@valguide/core/features/profiles/update-profile'
import { useProfile } from '../hooks/use-profile'
import { ProfileForm } from './profile-form'

export function ProfileFormConnected() {
  const { profile, isLoading, refetch } = useProfile()

  return (
    <ProfileForm
      profile={profile}
      isLoading={isLoading}
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
  )
}
