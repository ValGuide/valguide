import { createServerFn } from '@tanstack/react-start'
import { getAuthSession } from './better-auth.server'
import { getUserStatus } from './get-user-status.server'

export type { UserStatus } from './get-user-status.server'

export const getUserStatusFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getAuthSession()
  const user = session?.user

  if (!user) {
    return null
  }

  const status = await getUserStatus(user.id, user.email ?? undefined)
  return { status, email: user.email ?? '' }
})
