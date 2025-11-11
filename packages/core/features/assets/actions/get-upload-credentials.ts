'use server'

import { createClient } from '@valguide/supabase/server'

export type UploadCredentials = {
  accessToken: string
  projectId: string
}

export async function getUploadCredentials(): Promise<UploadCredentials> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('No active session')
  }

  const supabaseUrl = process.env.VG_SUPABASE_URL

  if (!supabaseUrl) {
    throw new Error('VG_SUPABASE_URL is not set')
  }

  // Extract project ID from Supabase URL (format: https://<project-id>.supabase.co)
  const projectId = new URL(supabaseUrl).hostname.split('.')[0]

  if (!projectId) {
    throw new Error('Could not extract project ID from Supabase URL')
  }

  return {
    accessToken: session.access_token,
    projectId,
  }
}
