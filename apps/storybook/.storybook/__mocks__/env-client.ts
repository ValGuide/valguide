// Mock for @valguide/core/env/client

import type { ClientEnv } from '@valguide/core/env/schema'
import type { StringifyValues } from '@valguide/core/utils/types'

export const clientEnv: StringifyValues<ClientEnv> = {
  VITE_POSTHOG_ENABLED: 'false',
  VITE_STUDIO_URL: 'https://studio.valguide.com',
  VITE_APP_DOMAIN: 'valguide.com',
  VITE_IMAGEKIT_URL: 'https://ik.imagekit.io/valguide',
  VITE_ENV: 'dev',
  VITE_STUDIO_SUPPORT_EMAIL: 'support@valguide.com',
  VITE_R2_PUBLIC_URL: 'https://assets.valguide.dev',
  VITE_IMAGE_PROVIDER: 'imagekit',
}
