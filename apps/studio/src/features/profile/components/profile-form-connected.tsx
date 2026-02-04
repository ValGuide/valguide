import { updateProfileFn } from '@valguide/core/features/profiles/update-profile.fn'
import { useProfile } from '../hooks/use-profile'
import { ProfileForm } from './profile-form'

export function ProfileFormConnected() {
  const { profile, refetch } = useProfile()

  return (
    <ProfileForm
      profile={profile}
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
