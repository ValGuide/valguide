import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth, getAuthSession } from '@valguide/core/features/auth/better-auth.server'
import { z } from 'zod'
import { isSuperadmin } from '@/server/utils/superadmin'

const validateAdminSessionFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getAuthSession()
  const user = session?.user

  if (!user?.id) {
    return { success: false }
  }

  if (!isSuperadmin(user.email)) {
    await auth.api.signOut({ headers: getRequestHeaders() })
    return { success: false }
  }

  return { success: true }
})

export const Route = createFileRoute('/auth/callback')({
  validateSearch: z.object({
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    if (search.error) {
      throw redirect({
        to: '/login',
        search: { next: undefined, email: undefined },
      })
    }

    const result = await validateAdminSessionFn()
    if (!result.success) {
      throw redirect({
        to: '/login',
        search: { next: undefined, email: undefined },
      })
    }

    throw redirect({ to: '/users' })
  },
})
