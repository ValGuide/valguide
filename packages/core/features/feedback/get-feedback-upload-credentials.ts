import { createServerFn } from '@tanstack/react-start'
import { serverEnv } from '@valguide/core/env/server'
import { UnauthenticatedError } from '@valguide/core/features/auth/authorization'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { createClient } from '@valguide/supabase/server'

// =============================================================================
// TYPES
// =============================================================================

export type UploadCredentials = {
  accessToken: string
  projectId: string
}

export type GetFeedbackUploadCredentialsResult = UploadCredentials

// =============================================================================
// SERVER FUNCTION
// =============================================================================

export const getFeedbackUploadCredentialsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async (): Promise<UploadCredentials> => {
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
  })
