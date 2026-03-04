import { createServerFn } from '@tanstack/react-start'
import { getAdminAuthSession } from '../admin-auth.server'
import { isSuperadmin } from '../utils/superadmin'

export type AdminUser = {
  id: string
  email: string | undefined
}

export const getCurrentAdminUserFn = createServerFn({ method: 'GET' }).handler(async (): Promise<AdminUser | null> => {
  const session = await getAdminAuthSession()

  if (!session?.user?.id || !isSuperadmin(session.user.email)) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
  }
})
