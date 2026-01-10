import { updateProfileFn } from '../actions'
import { useProfile } from '../hooks/use-profile'
import { ProfileForm } from './profile-form'

export function ProfileFormConnected() {
  const { profile, isLoading, refetch } = useProfile()

  return (
    <ProfileForm
      profile={profile}
      isLoading={isLoading}
      onSubmit={async (data) => {
        const result = await updateProfileFn({ data })
        return result
      }}
      onSuccess={refetch}
    />
  )
}
