import { createMiddleware } from '@tanstack/react-start'
import { NotFoundError } from '@valguide/features/auth/authorization'
import { getAdminAuthSession } from './admin-auth.server'
import { isSuperadmin } from './utils/superadmin'

// TODO: fix /en, etc. apparently not working due to this
export const adminMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const session = await getAdminAuthSession()
  const user = session?.user

  if (!user?.id) {
    throw new NotFoundError('Admin user not authenticated')
  }

  const email = user.email as string | undefined
  if (!isSuperadmin(email)) {
    throw new NotFoundError('Superadmin access required')
  }

  return next({ context: { user: { id: user.id, email: user.email ?? '' } } })
})
