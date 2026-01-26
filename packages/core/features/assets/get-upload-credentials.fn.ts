import { createServerFn } from '@tanstack/react-start'
import { requireAuthMiddleware } from '../auth/middleware'
import { getUploadCredentials, type UploadCredentials } from './get-upload-credentials.server'

export type { UploadCredentials } from './get-upload-credentials.server'

export const getUploadCredentialsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async (): Promise<UploadCredentials> => {
    return getUploadCredentials()
  })
