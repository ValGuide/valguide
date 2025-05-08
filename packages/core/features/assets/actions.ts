'use server'

import { createClient } from '@valguide/supabase/server'

export type GetTokenAction = () => Promise<{ token: string }>

export const getTokenAction: GetTokenAction = async () => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.access_token
  if (!token) {
    throw Error('Token is null')
  }
  return { token }
}
