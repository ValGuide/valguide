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
  MAINTENANCE_SLACK_CHANNEL: 'maintenance-mock',
  USERS_SLACK_CHANNEL: 'users-mock',
  STUDIO_FEEDBACK_SLACK_CHANNEL: 'studio-feedback-mock',
  ADMIN_BASE_URL: 'https://ops.val.guide',
  VITE_ENV: 'dev',
  NODE_ENV: 'development',
  APP_BASE_URL: 'https://app.valguide.com',
  VITE_STUDIO_URL: 'https://studio.valguide.com',
  LINEAR_FEEDBACK_TEAM_ID: 'team-mock',
  LINEAR_FEEDBACK_LABEL_ID: 'label-mock',
}
