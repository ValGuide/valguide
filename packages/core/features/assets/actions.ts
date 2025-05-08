'use server'

import { createClient } from '@valguide/supabase/server'

export const getUploadUrlAction = async () => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.access_token
}
