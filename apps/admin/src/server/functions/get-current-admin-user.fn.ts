import { createServerFn } from '@tanstack/react-start'
import { createAdminClient } from '../supabase'

export type AdminUser = {
  id: string
  email: string | undefined
}

export const getCurrentAdminUserFn = createServerFn({ method: 'GET' }).handler(async (): Promise<AdminUser | null> => {
  const supabase = await createAdminClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return {
    id: data.user.id,
    email: data.user.email,
  }
})
