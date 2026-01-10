// Mock for @valguide/core/features/auth/server-functions

export type AuthUser = {
  id: string
  email: string | undefined
}

export const getCurrentUserFn = async (): Promise<AuthUser | null> => ({
  id: 'mock-user-id',
  email: 'mock@example.com',
})

export const signInWithOtpFn = async () => ({
  data: {},
  error: null,
})

export const verifyOtpFn = async () => ({
  data: {},
  error: null,
})

export const signOutFn = async () => ({
  error: null,
})
