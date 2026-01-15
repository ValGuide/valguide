// Mock for @valguide/core/env/server

import type { ServerEnv } from '@valguide/core/env/schema'
import type { StringifyValues } from '@valguide/core/utils/types'

export const serverEnv: StringifyValues<ServerEnv> = {
  DATABASE_URL: 'mock-database-url',
  SUPABASE_URL: 'https://mock.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'mock-publishable-key',
  SUPABASE_COOKIE_DOMAIN: undefined,
  KV_REST_API_URL: undefined,
  KV_REST_API_TOKEN: undefined,
  DRIIZLE_LOG_ENABLED: 'false',
  RESEND_SENDING_API_KEY: undefined,
  EMAIL_FROM: 'ValGuide <noreply@valguide.com>',
  VALBOT_SLACK_TOKEN: undefined,
  VERCEL_ENV: 'development' as const,
  NODE_ENV: 'development' as const,
  APP_BASE_URL: 'https://app.valguide.com',
  VITE_STUDIO_URL: 'https://studio.valguide.com',
}
