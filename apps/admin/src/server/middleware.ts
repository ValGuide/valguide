import { createMiddleware } from '@tanstack/react-start'
import { NotFoundError } from '@valguide/features/auth/authorization'
import { createAdminClient } from './supabase'
import { isSuperadmin } from './utils/superadmin'


// TODO: fix /en, etc. apparently not working due to this
export const adminMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const supabase = await createAdminClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims?.sub) {
    throw new NotFoundError('Admin user not authenticated')
  }

  const email = data.claims.email as string | undefined
  if (!isSuperadmin(email)) {
    throw new NotFoundError('Superadmin access required')
  }

  const user = {
    id: data.claims.sub,
    email: data.claims.email as string,
  }

  return next({ context: { user } })
})
