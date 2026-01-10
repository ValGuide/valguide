// Mock for @/features/profile/actions (studio app)

export type ProfileFormData = {
  username?: string
  firstName?: string
  lastName?: string
}

export const updateProfileFn = async () => ({ success: true })
