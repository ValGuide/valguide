import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@valguide/supabase/server'
import { getUserStatus } from './get-user-status.server'

export type { UserStatus } from './get-user-status.server'

export const getUserStatusFn = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    return null
  }

  const status = await getUserStatus(user.sub, user.email as string | undefined)
  return { status }
})
