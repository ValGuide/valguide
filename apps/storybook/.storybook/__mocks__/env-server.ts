// Mock for @valguide/core/env/server

import type { ServerEnv } from '@valguide/core/env/schema'
import type { StringifyValues } from '@valguide/core/utils/types'

export const serverEnv: StringifyValues<ServerEnv> = {
  DATABASE_URL: 'mock-database-url',
  BETTER_AUTH_SECRET: 'mock-better-auth-secret',
  BETTER_AUTH_URL: 'https://auth.valguide.com',
  BETTER_AUTH_TRUSTED_ORIGINS: 'https://app.valguide.com,https://studio.valguide.com',
  BETTER_AUTH_COOKIE_DOMAIN: '.valguide.com',
  BETTER_AUTH_COOKIE_PREFIX: 'valguide-auth',
  BETTER_AUTH_DEV_OTP: '000000',
  DRIZZLE_LOG_ENABLED: 'false',
  RESEND_SENDING_API_KEY: 'mock-resend-api-key',
  EMAIL_FROM: 'ValGuide <noreply@valguide.com>',
  VALBOT_SLACK_TOKEN: 'mock-slack-token',
  NODE_ENV: 'development',
  APP_BASE_URL: 'https://app.valguide.com',
  VITE_STUDIO_URL: 'https://studio.valguide.com',
}
