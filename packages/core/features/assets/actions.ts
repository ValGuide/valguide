'use server'

import { createClient } from '@valguide/supabase/server'

export type GetUploadUrlAction = () => Promise<{ token: string; url: string; apiKey: string }>

export const getUploadUrlAction: GetUploadUrlAction = async () => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.access_token
  if (!token) {
    throw Error('Token is null')
  }
  const url = `${process.env.VG_SUPABASE_URL}/storage/v1/upload/resumable` // Supabase TUS endpoint

  const apiKey = process.env.VG_SUPABASE_ANON_KEY!!
  return { token, url, apiKey }
}
