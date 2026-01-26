import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@valguide/supabase/server'
import { serverEnv } from '../../env/server'
import { UnauthenticatedError } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'

// =============================================================================
// TYPES
// =============================================================================

export type UploadCredentials = {
  accessToken: string
  projectId: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getUploadCredentials(): Promise<UploadCredentials> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new UnauthenticatedError()
  }

  const supabaseUrl = serverEnv.SUPABASE_URL
  const projectId = new URL(supabaseUrl).hostname.split('.')[0]

  if (!projectId) {
    throw new Error('Could not extract project ID from Supabase URL')
  }

  return {
    accessToken: session.access_token,
    projectId,
  }
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

export const getUploadCredentialsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async (): Promise<UploadCredentials> => {
    return getUploadCredentials()
  })
