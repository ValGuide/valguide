// Mock for @valguide/core/env/client

import type { ClientEnv } from '@valguide/core/env/schema'
import type { StringifyValues } from '@valguide/core/utils/types'

export const clientEnv: StringifyValues<ClientEnv> = {
  VITE_POSTHOG_ENABLED: 'false',
  VITE_POSTHOG_KEY: undefined,
  VITE_POSTHOG_HOST: undefined,
  VITE_STUDIO_URL: 'https://studio.valguide.com',
  VITE_APP_DOMAIN: 'valguide.com',
  VITE_IMAGEKIT_URL: 'https://ik.imagekit.io/valguide',
  VITE_ENV: 'dev',
}
